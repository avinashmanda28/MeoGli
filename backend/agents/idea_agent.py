"""
IdeaFlow Guided Assistant - Step-by-step idea structuring
"""

from typing import Dict, Optional, List


# Define the idea flow structure with questions and options
IDEA_FLOW_QUESTIONS = {
    "type": {
        "question": "What type of content do you want to create?",
        "options": ["Educational", "Motivational", "News", "Entertainment", "Tutorial"]
    },
    "topic": {
        "question": "What is the main topic or subject?",
        "options": None  # Open-ended
    },
    "angle": {
        "question": "What angle or perspective do you want?",
        "options": ["Deep Dive", "Quick Facts", "Story-Driven", "Controversial", "Trending"]
    },
    "audience": {
        "question": "Who is your target audience?",
        "options": ["General Public", "Tech Enthusiasts", "Students", "Professionals", "Creators"]
    },
    "mode": {
        "question": "What video mode do you prefer?",
        "options": ["Faceless", "Animated", "Documentary", "Vlog", "Montage"]
    },
    "tone": {
        "question": "What tone should the video have?",
        "options": ["Serious", "Casual", "Energetic", "Mysterious", "Humorous"]
    }
}

FIELD_ORDER = ["type", "topic", "angle", "audience", "mode", "tone"]


def generate_idea_flow(user_input: Dict) -> Dict:
    """
    Guide user step-by-step through idea structuring via Guided Assistant.
    
    If input is incomplete:
        Returns next question + options
    
    If input is complete:
        Returns finalized idea structure
    
    Args:
        user_input: Partial or complete user input dictionary
        
    Returns:
        Either a question dict (for more input) or a final idea dict
    """
    
    # Find first missing field
    missing_field = None
    for field in FIELD_ORDER:
        if field not in user_input or not user_input[field]:
            missing_field = field
            break
    
    # If all fields are filled, return final idea
    if missing_field is None:
        return _finalize_idea(user_input)
    
    # Otherwise, return next question
    question_config = IDEA_FLOW_QUESTIONS[missing_field]
    
    return {
        "status": "question",
        "field": missing_field,
        "question": question_config["question"],
        "options": question_config["options"],
        "filled_fields": {k: user_input[k] for k in user_input if k in FIELD_ORDER}
    }


def _finalize_idea(user_input: Dict) -> Dict:
    """
    Finalize and structure the complete idea.
    
    Args:
        user_input: Complete user input with all fields
        
    Returns:
        Finalized idea structure ready for pipeline
    """
    
    # Extract fields with fallbacks
    content_type = user_input.get("type", "Educational")
    topic = user_input.get("topic", "General")
    angle = user_input.get("angle", "Deep Dive")
    audience = user_input.get("audience", "General Public")
    mode = user_input.get("mode", "Faceless")
    tone = user_input.get("tone", "Serious")
    
    # Generate title based on inputs
    title = f"{angle}: {topic} for {audience}"
    
    # Determine visual style based on mode and tone
    visual_style = _determine_visual_style(mode, tone)
    
    return {
        "status": "complete",
        "idea": {
            "title": title,
            "type": content_type,
            "topic": topic,
            "angle": angle,
            "audience": audience,
            "mode": mode,
            "tone": tone,
            "visual_style": visual_style
        }
    }


def _determine_visual_style(mode: str, tone: str) -> str:
    """
    Determine visual style based on mode and tone.
    
    Args:
        mode: Video mode (Faceless, Animated, etc.)
        tone: Video tone (Serious, Casual, etc.)
        
    Returns:
        Visual style string
    """
    
    if tone == "Serious" or tone == "Mysterious":
        return "cinematic dark"
    elif tone == "Energetic" or tone == "Humorous":
        return "dynamic vibrant"
    elif tone == "Casual":
        return "soft warm"
    else:
        return "cinematic"
