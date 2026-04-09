# MeoGli

MeoGli is an AI-powered video generation tool. Enter a text prompt and it generates a cinematic video using Stable Diffusion for image generation, background removal, and scene composition.

---

## Features

- Text-to-video generation from a single prompt
- AI image generation using Stable Diffusion v1-5
- Automatic background removal per scene
- Scene JSON export for video rendering
- Simple web UI to enter prompts and preview output

---

## How to Run

**Prerequisites**
- Python 3.9+
- Node.js 18+

**Start everything**

```bash
chmod +x start.sh
./start.sh
```

This will:
1. Install Python dependencies
2. Start the FastAPI backend at `http://localhost:8000`
3. Start the Next.js frontend at `http://localhost:3000`
4. Install Remotion dependencies

---

## Folder Structure

```
MeoGli/
├── backend/
│   ├── main.py          # FastAPI app and routes
│   └── pipeline.py      # Image generation and processing pipeline
├── frontend/
│   └── app/
│       └── page.tsx     # Main UI page
├── remotion/            # Video rendering
├── output/
│   ├── images/          # Generated images
│   ├── processed/       # Background-removed images
│   └── scenes.json      # Scene data for rendering
├── requirements.txt     # Python dependencies
└── start.sh             # Startup script
```

---

## Usage

1. Open `http://localhost:3000`
2. Enter a text prompt
3. Click **Generate**
4. Wait for the pipeline to complete
5. Video preview will appear on the page
