"""FastAPI backend server for MeoGli video generation."""

import os
import uuid
import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

from backend.pipeline import run_pipeline
from backend.progress import get_progress, reset_progress
from backend.agents.idea_agent import generate_idea_flow

# ─────────────────────────────────────────
# Logging
# ─────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# Models
# ─────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    mode: str = "short"


class GenerateResponse(BaseModel):
    status: str
    video: str | None = None
    error: str | None = None


# ─────────────────────────────────────────
# Setup
# ─────────────────────────────────────────
OUTPUT_DIR = "output"

def create_output_dirs():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/images", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/processed", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MeoGli backend...")
    create_output_dirs()
    yield
    logger.info("Shutting down backend")


app = FastAPI(lifespan=lifespan)

# ─────────────────────────────────────────
# ✅ FIXED CORS (simple + stable)
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # simplified to avoid Codespaces issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# ✅ FIX: handle preflight (OPTIONS)
# ─────────────────────────────────────────
@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return JSONResponse(status_code=200, content={"ok": True})

# ─────────────────────────────────────────
# Static files
# ─────────────────────────────────────────
app.mount("/output", StaticFiles(directory="output"), name="output")

# ─────────────────────────────────────────
# Error handler
# ─────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error"},
    )

# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "MeoGli backend running"
    }


@app.get("/progress")
async def progress():
    return get_progress()


@app.post("/idea")
async def idea(request: Request):
    body = await request.json()
    return generate_idea_flow(body)


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}] Generating video for prompt: {request.prompt[:50]}")

    try:
        result = await asyncio.to_thread(
            run_pipeline,
            request.prompt,
            request.mode,
        )

        if result and os.path.exists(result):
            return {
                "status": "completed",
                "video": "/output/final.mp4"
            }

        raise HTTPException(status_code=500, detail="Video generation failed")

    except Exception as e:
        logger.exception("Generation error")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Run
# ─────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
