#!/bin/bash

echo "[1/4] Installing backend dependencies..."
pip install -r requirements.txt

echo "[2/4] Starting backend server..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

echo "[3/4] Installing and starting frontend..."
(cd frontend && npm install && npm run dev) &

echo "[4/4] Installing remotion dependencies..."
(cd remotion && npm install) &

wait
