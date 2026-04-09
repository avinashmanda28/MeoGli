@echo off
echo.
echo 🚀 Starting MeoGli Stack...
echo.

REM Check if running in correct directory
if not exist "backend" (
    echo ❌ Please run this script from the MeoGli root directory
    exit /b 1
)

REM Start Backend
echo Starting Backend (FastAPI)...
start cmd /k "cd backend && pip install fastapi uvicorn python-multipart && python -m uvicorn main:app --reload --port 8000"
echo ✓ Backend started on http://localhost:8000
timeout /t 2 /nobreak

REM Start Frontend
echo Starting Frontend (Next.js)...
start cmd /k "cd frontend && npm install && npm run dev"
echo ✓ Frontend started on http://localhost:3000
timeout /t 3 /nobreak

echo.
echo 🎉 MeoGli Stack is running!
echo.
echo 📍 Services:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause
