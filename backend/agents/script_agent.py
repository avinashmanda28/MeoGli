def generate_script(prompt: str) -> dict:
    """
    Generate a viral script engine from a prompt.

    Returns a structured script dict with 5 parts:
    - hook: Attention-grabbing opener (max 12 words)
    - build: Context and relatability
    - open_loop: Unresolved curiosity
    - twist: Unexpected shift
    - payoff: Strong conclusion

    Args:
        prompt: User input text

    Returns:
        Dict with hook, build, open_loop, twist, payoff
    """

    # Clean input
    prompt = prompt.strip().lower()

    if not prompt:
        return {
            "hook": "Nobody is talking about this secret.",
            "build": "It affects everyone you know.",
            "open_loop": "But the truth is coming out.",
            "twist": "And it's not what you think.",
            "payoff": "Everything changes now."
        }

    # Determine angle based on keywords
    if "ai" in prompt:
        # Future/impact angle
        hook = "AI is about to change everything."
        build = "We're standing at the edge of a technological revolution."
        open_loop = "But most people have no idea what's coming."
        twist = "The real breakthrough isn't what you expect."
        payoff = "Humanity will never be the same."
    elif "money" in prompt:
        # Urgency/wealth angle
        hook = "Your money is at risk right now."
        build = "Markets are shifting faster than ever before."
        open_loop = "But there's a hidden opportunity emerging."
        twist = "The wealthy already know the secret."
        payoff = "Fortune favors those who act first."
    else:
        # General curiosity angle
        hook = "Nobody is talking about this yet."
        build = "It started small, but it's spreading everywhere."
        open_loop = "The question is, are you ready?"
        twist = "What if I told you it's already here?"
        payoff = "The world will never be the same."

    return {
        "hook": hook,
        "build": build,
        "open_loop": open_loop,
        "twist": twist,
        "payoff": payoff
    }
