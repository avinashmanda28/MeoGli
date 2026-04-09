"""
Advanced Progress Tracking System for MeoGli Pipeline
"""

from typing import List, Dict, Optional

# Global progress state
_progress_state = {
    "progress": 0,
    "current_step": "Understanding idea",
    "steps": [
        "Understanding idea",
        "Writing script",
        "Structuring scenes",
        "Designing visuals",
        "Generating images",
        "Rendering video",
        "Finalizing output"
    ]
}


def update_progress(step_name: str, progress_value: int) -> Dict:
    """
    Update progress state with new step and progress value.
    
    Args:
        step_name: Name of the current step (must match one in steps list)
        progress_value: Progress percentage (0-100)
        
    Returns:
        Updated progress state dictionary
    """
    global _progress_state
    
    if step_name not in _progress_state["steps"]:
        return {"error": f"Unknown step: {step_name}"}
    
    # Ensure valid progress value
    progress_value = max(0, min(100, progress_value))
    
    _progress_state["progress"] = progress_value
    _progress_state["current_step"] = step_name
    
    return _progress_state.copy()


def get_progress() -> Dict:
    """
    Get current progress state with step statuses.
    
    Returns:
        Dictionary with progress, current_step, and steps with statuses
    """
    global _progress_state
    
    current_step = _progress_state["current_step"]
    current_index = _progress_state["steps"].index(current_step)
    
    # Build steps with status information
    steps_with_status = []
    for idx, step in enumerate(_progress_state["steps"]):
        if idx < current_index:
            status = "done"
        elif idx == current_index:
            status = "active"
        else:
            status = "pending"
        
        steps_with_status.append({
            "name": step,
            "status": status
        })
    
    return {
        "progress": _progress_state["progress"],
        "current_step": current_step,
        "steps": steps_with_status
    }


def reset_progress() -> Dict:
    """
    Reset progress to initial state.
    
    Returns:
        Reset progress state
    """
    global _progress_state
    
    _progress_state = {
        "progress": 0,
        "current_step": "Understanding idea",
        "steps": [
            "Understanding idea",
            "Writing script",
            "Structuring scenes",
            "Designing visuals",
            "Generating images",
            "Rendering video",
            "Finalizing output"
        ]
    }
    
    return _progress_state.copy()
