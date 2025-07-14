# Automated Bank Sales Interview Taker

## Overview
This project is an automated bank sales interview taker for native Indian languages (primarily Hindi). It uses:
- **Frontend:** Vite + React
- **Backend:** FastAPI (Python)
- **Voice:** Sarvam AI (TTS/STT), Deepgram (STT), ElevenLabs (TTS), Vocode (voice pipeline)
- **Brain:** OpenAI (LLM/interview logic)

## Getting Started
- `frontend/`: React app (Vite)
- `backend/`: FastAPI app

---

## Quick Start

1. Install backend dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```
2. Start backend:
    ```bash
    uvicorn backend.main:app --reload
    ```
3. Start frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
