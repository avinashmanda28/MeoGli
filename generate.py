import os
import json

# STEP 1: Get prompt
def get_prompt():
    return input("Enter your video idea: ")

# STEP 2: Generate script (dummy for now)
def generate_script(prompt):
    return f"This is a script about: {prompt}"

# STEP 3: Convert script → scenes
def script_to_scenes(script):
    scenes = [
        {"text": script, "duration": 5}
    ]
    return scenes

# STEP 4: Save scenes
def save_scenes(scenes):
    with open("scenes.json", "w") as f:
        json.dump(scenes, f, indent=2)

# MAIN PIPELINE
def main():
    prompt = get_prompt()
    script = generate_script(prompt)
    scenes = script_to_scenes(script)
    save_scenes(scenes)
    print("✅ Scenes generated!")

if __name__ == "__main__":
    main()
