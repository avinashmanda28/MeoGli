import re


def plan_scenes(script: str) -> list:
    """
    Convert a script into a list of scenes.
    
    Each sentence becomes one scene with:
    - id: sequential scene identifier
    - text: the sentence content
    - duration: 90 frames (3 seconds at 30fps)
    - image: placeholder image from picsum.photos with incrementing seed
    
    Args:
        script: Full script text (sentences separated by periods)
        
    Returns:
        List of scene dictionaries
    """
    
    # Clean input
    script = script.strip()
    
    if not script:
        return []
    
    # Split into sentences (basic approach: split by . ! ?)
    sentences = re.split(r'[.!?]+', script)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Ensure at least 3 scenes (duplicate if needed)
    if len(sentences) < 3:
        # Pad with sentences if too few
        while len(sentences) < 3:
            sentences.append(sentences[-1] if sentences else "")
    
    # Convert sentences to scenes
    scenes = []
    for idx, sentence in enumerate(sentences, 1):
        if not sentence:  # Skip empty sentences
            continue
        
        scene = {
            "id": f"scene{idx}",
            "text": sentence,
            "duration": 90,
            "image": f"https://picsum.photos/seed/{idx}/1280/720"
        }
        scenes.append(scene)
    
    return scenes
