def generate_images(scenes: list) -> list:
    """
    Generate image URLs for each scene based on visual query.
    
    Uses placeholder images from picsum.photos with different
    seed patterns for variety:
    - First 60% of scenes: standard seed pattern
    - Remaining 40% of scenes: AI-themed seed pattern
    
    Args:
        scenes: List of scene dictionaries with "visual_query" field
        
    Returns:
        Updated list of scenes with "image" field set
    """
    
    if not scenes:
        return []
    
    total_scenes = len(scenes)
    threshold = int(total_scenes * 0.6)  # 60% threshold
    
    updated_scenes = []
    
    for idx, scene in enumerate(scenes):
        # Safety check
        if not isinstance(scene, dict):
            continue
        
        # Create a copy to avoid mutating original
        scene_copy = scene.copy()
        
        # Generate image URL based on position in list
        if idx < threshold:
            # First 60%: standard seed pattern
            image_url = f"https://picsum.photos/seed/{idx + 1}/1280/720"
        else:
            # Remaining 40%: AI-themed seed pattern
            image_url = f"https://picsum.photos/seed/ai{idx + 1}/1280/720"
        
        scene_copy["image"] = image_url
        updated_scenes.append(scene_copy)
    
    return updated_scenes
