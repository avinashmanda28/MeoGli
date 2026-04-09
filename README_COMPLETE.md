# MeoGli - AI Video Generation Platform

A complete, production-ready video generation system combining backend AI agents with a modern Next.js frontend.

## 🎯 Architecture

```
MeoGli Pipeline:
User Input → Script Agent → Planner (Scenes) → Visual Agent → Image Agent → Remotion Render → Video Output
```

## 📁 Project Structure

```
MeoGli/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Main API server
│   ├── progress.py            # Progress tracking system
│   └── agents/                # AI agents
│       ├── script_agent.py    # Script generation
│       ├── planner_agent.py   # Scene planning
│       ├── visual_agent.py    # Visual design
│       └── image_agent.py     # Image URLs
├── frontend/                  # Next.js React frontend
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   └── globals.css       # Tailwind styles
│   └── package.json
├── remotion/                  # Remotion video renderer
│   ├── src/
│   │   ├── index.ts          # Root entry
│   │   ├── Root.tsx          # Composition config
│   │   ├── Video.tsx         # Video component with animations
│   │   └── scenes.json       # Scene data (generated)
│   └── package.json
└── output/                    # Generated videos
```

## 🚀 Quick Start

### 1. Setup Backend

```bash
# Install Python dependencies
pip install fastapi uvicorn python-multipart

# Navigate to project root
cd MeoGli

# Start backend server
uvicorn backend.main:app --reload --port 8000
```

The backend will:
- Listen on `http://localhost:8000`
- Expose `/generate`, `/progress`, `/idea` endpoints
- Support CORS for frontend requests

### 2. Setup Remotion

```bash
cd remotion

# Install Node dependencies
npm install

# Test render
npm run render
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎮 How to Use

### Via Frontend (Recommended)

1. **Open Browser**: Go to `http://localhost:3000`
2. **Enter Prompt**: Type your video idea
3. **Or Use IdeaFlow**: Click "💡 Need Ideas?" for guided creation
4. **Click Generate**: Watch progress in real-time
5. **Preview**: Watch and download your video

### Via API

**Generate Video:**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "The future of AI"}'
```

**Check Progress:**
```bash
curl http://localhost:8000/progress
```

**Use IdeaFlow Assistant:**
```bash
# Step 1: Get first question
curl -X POST http://localhost:8000/idea \
  -H "Content-Type: application/json" \
  -d '{}'

# Step 2: Answer and continue
curl -X POST http://localhost:8000/idea \
  -H "Content-Type: application/json" \
  -d '{"type": "Educational"}'
```

## 📊 Pipeline Details

### Step 1: Understanding Idea (5%)
- Receives user prompt
- Validates input

### Step 2: Writing Script (15%)
- **Agent**: `script_agent.py`
- Creates 4-sentence structured script
- Example: "AI is changing everything. It is reshaping..."

### Step 3: Structuring Scenes (30%)
- **Agent**: `planner_agent.py`
- Splits script into scenes
- Assigns duration (90 frames = 3 seconds)
- One scene per sentence

### Step 4: Designing Visuals (45%)
- **Agent**: `visual_agent.py`
- Analyzes scene text
- Generates visual descriptions
- Keywords: cinematic, futuristic, etc.

### Step 5: Generating Images (65%)
- **Agent**: `image_agent.py`
- Creates placeholder image URLs
- Uses picsum.photos for variety
- Pattern: `https://picsum.photos/seed/{index}/1280/720`

### Step 6: Rendering Video (85%)
- Calls Remotion via CLI
- Renders all scenes with animations
- Applies Ken Burns effect (zoom)
- Staggered text animations
- Smooth transitions between scenes
- Output: `/output/final.mp4`

### Step 7: Finalizing Output (100%)
- Video ready for download
- Frontend shows preview
- Progress complete

## 🎨 Features

### Backend
- ✅ Modular agent system
- ✅ Real-time progress tracking
- ✅ IdeaFlow guided assistant
- ✅ Error handling at each step
- ✅ CORS-enabled API
- ✅ Strict execution order

### Frontend
- ✅ Dark theme with blue accents
- ✅ Glass-effect cards
- ✅ Real-time progress bar
- ✅ Step-by-step status indicators
- ✅ IdeaFlow modal chat
- ✅ Video preview player
- ✅ Download button
- ✅ Responsive design
- ✅ Loading animations
- ✅ Error messages

### Video
- ✅ Professional animations
- ✅ Ken Burns zoom effect
- ✅ Staggered word animations
- ✅ Word highlighting (gold/blue)
- ✅ Gradient overlays
- ✅ Smooth transitions
- ✅ Cinematic styling

## 🔧 Configuration

### Customize Scene Duration
Edit `backend/agents/planner_agent.py`:
```python
scene = {
    "duration": 90,  # Change frame count (30 fps)
}
```

### Customize Visual Rules
Edit `backend/agents/visual_agent.py`:
```python
visual_rules = {
    "your_keyword": "your visual description",
}
```

### Customize Prompts
Each agent can be customized:
- `script_agent.py` - Script format
- `planner_agent.py` - Scene duration
- `visual_agent.py` - Visual keywords
- `image_agent.py` - Image URL patterns

## 📝 API Reference

### POST /generate
Generate a video from prompt.

**Request:**
```json
{
  "prompt": "Your video idea here"
}
```

**Response:**
```json
{
  "status": "success",
  "video": "/output/final.mp4",
  "message": "Video generated successfully",
  "progress": {
    "progress": 100,
    "current_step": "Finalizing output",
    "steps": [...]
  },
  "scenes_count": 4
}
```

### GET /progress
Get current pipeline progress.

**Response:**
```json
{
  "progress": 65,
  "current_step": "Generating images",
  "steps": [
    {"name": "Understanding idea", "status": "done"},
    {"name": "Writing script", "status": "done"},
    {"name": "Generating images", "status": "active"},
    {"name": "Rendering video", "status": "pending"}
  ]
}
```

### POST /idea
IdeaFlow guided assistant.

**Request (Empty - First Question):**
```json
{}
```

**Response (Question):**
```json
{
  "status": "question",
  "field": "type",
  "question": "What type of content do you want to create?",
  "options": ["Educational", "Motivational", "News", "Entertainment", "Tutorial"],
  "filled_fields": {}
}
```

**Request (With Answer):**
```json
{
  "type": "Educational"
}
```

**Response (Final Idea):**
```json
{
  "status": "complete",
  "idea": {
    "title": "Deep Dive: Artificial Intelligence for Tech Enthusiasts",
    "type": "Educational",
    "topic": "Artificial Intelligence",
    "tone": "Serious",
    "visual_style": "cinematic dark"
  }
}
```

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Ensure backend dependencies are installed
pip install fastapi uvicorn python-multipart
```

### "Can't connect to server"
- Check if backend is running on port 8000
- Check if frontend is configured with correct API URL
- Check CORS settings in `backend/main.py`

### Video rendering taking too long
- Reduce scene duration in planner agent
- Reduce total number of scenes
- Check system resources

### IdeaFlow not working
- Check browser console for errors
- Verify `/idea` endpoint is accessible
- Ensure backend server is running

## 📦 Deploy

### Heroku/Railway (Backend)
```bash
cd backend
git push heroku main
```

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
```

Update frontend API URL in `src/app/page.tsx`:
```typescript
const res = await fetch('https://your-backend-url.com/generate', ...);
```

## 🔐 Production Notes

- Add authentication for API endpoints
- Implement rate limiting
- Add video cleanup (old files)
- Use S3 for video storage
- Add watermark to videos
- Implement premium features

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Real image generation (DALL-E, Midjourney)
- Voice generation (TTS)
- More animation styles
- Music/sound effects
- Multi-language support
- Video templates

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation
3. Check backend logs
4. Check browser console

---

**MeoGli** - Making AI video generation simple and accessible.
