def generate_visuals(scenes: list) -> list:
    """
    Enhance scenes with visual descriptions based on emotional tone.

    Each scene receives:
    - emotion: inferred from keywords in the text
    - visual_query: cinematic description aligned with that emotion

    Args:
        scenes: List of scene dictionaries with "text" field

    Returns:
        Updated list of scenes with "emotion" and "visual_query" fields added
    """

    if not scenes:
        return []

    emotion_rules = {
        "fear": ["danger", "loss", "fear", "threat", "attack"],
        "motivation": ["success", "win", "growth", "rise", "power"],
        "curiosity": ["unknown", "secret", "mystery", "hidden", "surprise"],
    }

    style_map = {
        "fear": "dark shadows cinematic high contrast",
        "motivation": "sunrise light cinematic inspiring",
        "curiosity": "mysterious abstract lighting",
        "neutral": "clean cinematic background",
    }

    context_map = {
        "ai": "futuristic AI lab",
        "future": "futuristic cityscape",
        "technology": "technology control room",
        "people": "emotional human portrait",
        "world": "wide cinematic landscape",
    }

    updated_scenes = []

    for scene in scenes:
        if not isinstance(scene, dict) or "text" not in scene:
            continue

        text = scene.get("text", "").strip()
        lower_text = text.lower()

        emotion = "neutral"
        for label, keywords in emotion_rules.items():
            if any(word in lower_text for word in keywords):
                emotion = label
                break

        style = style_map.get(emotion, style_map["neutral"])

        context = next((desc for key, desc in context_map.items() if key in lower_text), None)
        if context:
            visual_query = f"{context} {style}"
        else:
            visual_query = f"{style}"

        if not visual_query.strip():
            visual_query = style_map["neutral"]

        scene_copy = scene.copy()
        scene_copy["emotion"] = emotion
        scene_copy["visual_query"] = visual_query
        updated_scenes.append(scene_copy)

    return updated_scenes
