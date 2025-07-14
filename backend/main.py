from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
import uuid
from tts import tts_sarvam, tts_elevenlabs, stt_sarvam

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

app = FastAPI()

# Print all registered routes and their methods at startup
@app.on_event("startup")
def print_routes():
    print("Registered routes:")
    for route in app.routes:
        methods = getattr(route, 'methods', None)
        print(f"{route.path} -> {methods}")

# Middleware to log every request (method and path)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# Serve static files for audio playback
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str
    language: str  # e.g., 'hi' for Hindi

class SpeakRequest(BaseModel):
    text: str
    language: str

@app.post("/interview/ask")
async def ask_question(req: MessageRequest):
    print("/interview/ask invoked")
    if req.language == "hi":
        prompt = (
            "You are a highly professional, formal interviewer conducting a structured job interview for a door-to-door sales agent position at a bank. "
            "You must ask clear, concise, and relevant interview questions in Hindi (use only Devanagari script). "
            "Your tone should be polite, formal, and fluent—never casual or like a helpline. "
            "Ask only one interview question at a time, and wait for the candidate's response before asking the next. "
            f"{req.message}"
        )
    else:
        prompt = (
            f"You are an automated bank sales interviewer. Respond in {req.language}. {req.message}"
        )
    print(f"[Agent] Prompt sent to LLM: {prompt}")
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": prompt}],
        max_tokens=256,
        temperature=0.7,
    )
    return {"response": response.choices[0].message.content}



@app.post("/api/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...), request: Request = None):
    print("/audio/transcribe invoked")
    if request:
        print("Method:", request.method)
        print("Headers:", dict(request.headers))
    # Save uploaded audio to disk
    temp_path = os.path.join(AUDIO_DIR, f"stt_{uuid.uuid4().hex}.wav")
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    # Call Sarvam AI STT
    transcript = await stt_sarvam(temp_path, language="hi")
    print(f"[STT] Transcript returned: {transcript}")
    # Optionally, delete temp file after
    os.remove(temp_path)
    return {"transcript": transcript}

from fastapi import Body

@app.post("/api/audio/speak")
async def speak_text(req: SpeakRequest, request: Request):
    print("/audio/speak invoked")
    print("Body:", req)
    print(f"[TTS] Text: {req.text}")
    print(f"[TTS] Language code: {req.language}")
    filename = f"tts_{uuid.uuid4().hex}.mp3"
    outpath = os.path.join(AUDIO_DIR, filename)
    # Use Sarvam for Hindi, ElevenLabs for English
    if req.language == "hi":
        # Pass Sarvam's required language code for Hindi
        await tts_sarvam(req.text, "hi-IN", outpath)
    else:
        await tts_elevenlabs(req.text, outpath)
    # Return URL for frontend (hardcoded base for now)
    base_url = request.base_url._url.rstrip("/")
    audio_url = f"{base_url}/audio/{filename}"
    return {"audio_url": audio_url}
