"""Video generation pipeline for MeoGli."""

import os
import json
import random
import logging
import time
import subprocess
from typing import Dict, List, Any
from pathlib import Path

import torch
from diffusers import StableDiffusionPipeline
from rembg import remove
from dotenv import load_dotenv

from backend.progress import update_progress, reset_progress

# ────────────────────────────────────────────────────────────────
# Environment & Logging
# ────────────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────
# Configuration
# ────────────────────────────────────────────────────────────────
DEVICE          = os.environ.get("DEVICE", "cpu")
HF_MODEL_ID     = os.environ.get("HF_MODEL_ID", "runwayml/stable-diffusion-v1-5")
HF_TOKEN        = os.environ.get("HF_TOKEN")
STYLE_PROMPT    = os.environ.get(
    "STYLE_PROMPT",
    "cinematic, futuristic, blue lighting, ultra realistic, high detail",
)
INFERENCE_STEPS = int(os.environ.get("INFERENCE_STEPS", "20"))

logger.info(f"[pipeline] Device: {DEVICE}")
logger.info(f"[pipeline] Model: {HF_MODEL_ID}")
logger.info(f"[pipeline] HF_TOKEN present: {bool(HF_TOKEN)}")
logger.info(f"[pipeline] Inference steps: {INFERENCE_STEPS}")

# ────────────────────────────────────────────────────────────────
# Output Directories
# ────────────────────────────────────────────────────────────────
OUTPUT_DIR    = Path("output")
IMAGES_DIR    = OUTPUT_DIR / "images"
PROCESSED_DIR = OUTPUT_DIR / "processed"

for _dir in [OUTPUT_DIR, IMAGES_DIR, PROCESSED_DIR]:
    _dir.mkdir(parents=True, exist_ok=True)

# ────────────────────────────────────────────────────────────────
# Model — Lazy loaded on first generate call, NOT at import time.
# This prevents the backend crashing on startup if the model is
# unavailable or HF_TOKEN is missing.
# ────────────────────────────────────────────────────────────────
_pipe: StableDiffusionPipeline | None = None


def _load_model() -> StableDiffusionPipeline:
    """Load Stable Diffusion model."""
    logger.info("[pipeline] Loading Stable Diffusion model...")
    start = time.time()

    try:
        kwargs: Dict[str, Any] = {
            "torch_dtype": torch.float16 if DEVICE == "cuda" else torch.float32,
        }
        if HF_TOKEN:
            kwargs["token"] = HF_TOKEN

        model = StableDiffusionPipeline.from_pretrained(HF_MODEL_ID, **kwargs)
        model = model.to(DEVICE)
        model.enable_attention_slicing()

        if DEVICE == "cuda":
            model.enable_xformers_memory_efficient_attention()

        elapsed = time.time() - start
        logger.info(f"[pipeline] Model loaded in {elapsed:.1f}s")
        return model

    except Exception as e:
        logger.error(f"[pipeline] Failed to load model: {e}")
        raise RuntimeError(f"Model initialization failed: {e}") from e


def _get_pipe() -> StableDiffusionPipeline:
    global _pipe
    if _pipe is None:
        _pipe = _load_model()
    return _pipe


# ────────────────────────────────────────────────────────────────
# Constants
# ────────────────────────────────────────────────────────────────
SHORT_KEYWORDS = {"short", "reel", "shorts", "9:16"}
LONG_KEYWORDS  = {"long", "full", "16:9"}

SCENE_TEMPLATES = [
    ("opening scene",    "establishing shot"),
    ("build-up scene",   "medium shot, environment detail"),
    ("main scene",       "close-up detail, peak action"),
    ("transition scene", "over-the-shoulder, atmospheric"),
    ("climax scene",     "dynamic angle, dramatic tension"),
    ("resolution scene", "wide angle, aftermath"),
    ("closing scene",    "wide angle, dramatic finish"),
]

# ────────────────────────────────────────────────────────────────
# Type Aliases
# ────────────────────────────────────────────────────────────────
VideoPlan = Dict[str, Any]
SceneData  = Dict[str, Any]


# ────────────────────────────────────────────────────────────────
# Step 1: Plan Video
# ────────────────────────────────────────────────────────────────
def plan_video(prompt: str, mode: str | None = None) -> VideoPlan:
    """Detect video type and return a production plan."""
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    words = set(prompt.lower().split())

    if mode:
        if mode not in ("short", "long"):
            raise ValueError(f"Invalid mode: {mode}")
        video_type = mode
    elif words & SHORT_KEYWORDS:
        video_type = "short"
    elif words & LONG_KEYWORDS:
        video_type = "long"
    else:
        video_type = "short"

    if video_type == "short":
        duration       = random.randint(20, 120)
        scene_duration = 4
        resolution     = {"width": 720, "height": 1280}
    else:
        duration       = random.randint(240, 1200)
        scene_duration = 6
        resolution     = {"width": 1280, "height": 720}

    scene_count = max(1, duration // scene_duration)

    plan: VideoPlan = {
        "type":           video_type,
        "duration":       duration,
        "scene_count":    scene_count,
        "scene_duration": scene_duration,
        "resolution":     resolution,
    }

    logger.info(
        f"[plan_video] type={video_type}, duration={duration}s, "
        f"scenes={scene_count}, resolution={resolution['width']}x{resolution['height']}"
    )
    return plan


# ────────────────────────────────────────────────────────────────
# Step 2: Generate Script
# ────────────────────────────────────────────────────────────────
def generate_script(prompt: str, plan: VideoPlan) -> List[SceneData]:
    """Generate scene descriptions from plan."""
    if not plan.get("scene_count") or not plan.get("scene_duration"):
        raise ValueError("Invalid plan provided")

    scene_count    = plan["scene_count"]
    scene_duration = plan["scene_duration"]

    scenes: List[SceneData] = [
        {
            "text":     f"{prompt} - {SCENE_TEMPLATES[i % len(SCENE_TEMPLATES)][0]}",
            "visual":   f"{prompt}, {SCENE_TEMPLATES[i % len(SCENE_TEMPLATES)][1]}, {STYLE_PROMPT}",
            "duration": scene_duration,
            "index":    i,
        }
        for i in range(scene_count)
    ]

    logger.info(f"[generate_script] Generated {len(scenes)} scenes")
    return scenes


# ────────────────────────────────────────────────────────────────
# Step 3: Generate Images
# ────────────────────────────────────────────────────────────────
def generate_images(scenes: List[SceneData], plan: VideoPlan) -> List[str]:
    """Generate images for each scene using Stable Diffusion."""
    if not scenes:
        raise ValueError("No scenes provided")

    resolution = plan.get("resolution")
    if not resolution:
        raise ValueError("Invalid plan - missing resolution")

    width  = resolution["width"]
    height = resolution["height"]
    image_paths: List[str] = []

    logger.info(f"[generate_images] Generating {len(scenes)} images at {width}x{height}")

    for i, scene in enumerate(scenes):
        try:
            logger.info(f"[generate_images] Scene {i + 1}/{len(scenes)}...")
            start = time.time()

            generator = torch.Generator(device=DEVICE).manual_seed(i * 42)

            image = _get_pipe()(
                scene["visual"],
                height=height,
                width=width,
                num_inference_steps=INFERENCE_STEPS,
                generator=generator,
            ).images[0]

            image_path = IMAGES_DIR / f"scene_{i}.png"
            image.save(str(image_path))
            image_paths.append(str(image_path))

            elapsed = time.time() - start
            logger.info(f"[generate_images] Scene {i + 1} done in {elapsed:.1f}s → {image_path}")

        except Exception as e:
            logger.error(f"[generate_images] Failed scene {i}: {e}")
            raise RuntimeError(f"Image generation failed at scene {i}: {e}") from e

    logger.info(f"[generate_images] All {len(image_paths)} images generated")
    return image_paths


# ────────────────────────────────────────────────────────────────
# Step 4: Remove Backgrounds
# ────────────────────────────────────────────────────────────────
def remove_background(image_paths: List[str]) -> List[str]:
    """Remove background from images using rembg."""
    if not image_paths:
        raise ValueError("No image paths provided")

    processed_paths: List[str] = []
    logger.info(f"[remove_background] Processing {len(image_paths)} images")

    for i, path in enumerate(image_paths):
        try:
            if not Path(path).exists():
                raise FileNotFoundError(f"Image not found: {path}")

            logger.info(f"[remove_background] {i + 1}/{len(image_paths)}: {path}")

            with open(path, "rb") as f:
                output_data = remove(f.read())

            processed_path = PROCESSED_DIR / f"scene_{i}.png"
            with open(processed_path, "wb") as f:
                f.write(output_data)

            processed_paths.append(str(processed_path))

        except Exception as e:
            logger.error(f"[remove_background] Failed image {i}: {e}")
            raise RuntimeError(f"Background removal failed at image {i}: {e}") from e

    logger.info(f"[remove_background] Done: {len(processed_paths)} images")
    return processed_paths


# ────────────────────────────────────────────────────────────────
# Step 5: Export JSON
# ────────────────────────────────────────────────────────────────
def export_json(scenes: List[SceneData], image_paths: List[str]) -> str:
    """Export scene data and image paths to JSON for Remotion."""
    if not scenes:
        raise ValueError("No scenes provided")
    if not image_paths:
        raise ValueError("No image paths provided")
    if len(scenes) != len(image_paths):
        raise ValueError(f"Mismatch: {len(scenes)} scenes vs {len(image_paths)} images")

    export_data = [
        {
            "index":    scene.get("index", i),
            "text":     scene["text"],
            "image":    image_paths[i],
            "duration": scene["duration"],
        }
        for i, scene in enumerate(scenes)
    ]

    json_path = OUTPUT_DIR / "scenes.json"
    with open(json_path, "w") as f:
        json.dump(export_data, f, indent=2)

    logger.info(f"[export_json] Exported to {json_path}")
    return str(json_path)


# ────────────────────────────────────────────────────────────────
# Step 6: Render Video (Remotion)
# ────────────────────────────────────────────────────────────────
def render_video(mode: str = "short") -> str:
    """Render scenes.json → final.mp4 using Remotion CLI."""
    composition = "MainVideoShort" if mode == "short" else "MainVideo"
    output_arg  = "../output/final.mp4"

    logger.info(f"[render_video] Rendering composition: {composition}")

    result = subprocess.run(
        ["npx", "remotion", "render", "src/index.ts", composition, output_arg],
        cwd="remotion",
        capture_output=True,
        text=True,
        timeout=300,
    )

    if result.returncode != 0:
        logger.error(f"[render_video] stderr: {result.stderr[-1000:]}")
        raise RuntimeError(f"Remotion render failed: {result.stderr[-500:]}")

    final_path = str(OUTPUT_DIR / "final.mp4")
    logger.info(f"[render_video] Video rendered: {final_path}")
    return final_path


# ────────────────────────────────────────────────────────────────
# Main Pipeline
# ────────────────────────────────────────────────────────────────
def run_pipeline(prompt: str, mode: str | None = None) -> str:
    """Run the complete video generation pipeline."""
    pipeline_start = time.time()
    logger.info(f"[run_pipeline] Starting for prompt: {prompt[:50]}...")

    try:
        reset_progress()

        logger.info("[run_pipeline] Step 1/6: Planning...")
        update_progress("Understanding idea", 5)
        plan = plan_video(prompt, mode)
        update_progress("Understanding idea", 14)

        logger.info("[run_pipeline] Step 2/6: Generating script...")
        update_progress("Writing script", 20)
        scenes = generate_script(prompt, plan)
        update_progress("Writing script", 28)

        logger.info("[run_pipeline] Step 3/6: Structuring scenes...")
        update_progress("Structuring scenes", 35)

        logger.info("[run_pipeline] Step 4/6: Generating images...")
        update_progress("Generating images", 42)
        image_paths = generate_images(scenes, plan)
        update_progress("Generating images", 60)

        logger.info("[run_pipeline] Step 5/6: Removing backgrounds...")
        update_progress("Designing visuals", 65)
        processed_paths = remove_background(image_paths)
        update_progress("Designing visuals", 75)

        logger.info("[run_pipeline] Step 5b: Exporting JSON...")
        update_progress("Structuring scenes", 80)
        export_json(scenes, processed_paths)

        logger.info("[run_pipeline] Step 6/6: Rendering video...")
        update_progress("Rendering video", 85)
        final_path = render_video(mode or "short")
        update_progress("Finalizing output", 100)

        elapsed = time.time() - pipeline_start
        logger.info(f"[run_pipeline] Complete in {elapsed:.1f}s")
        return final_path

    except Exception as e:
        logger.error(f"[run_pipeline] Failed: {e}")
        raise RuntimeError(f"Pipeline failed: {e}") from e
