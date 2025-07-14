import os
import logging
import httpx
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

client = SarvamAI(
    api_subscription_key=SARVAM_API_KEY,
)

import asyncio

def _tts_sarvam_sync(text, language, output_path):
    """
    Uses SarvamAI SDK to convert text to speech in a custom voice and saves it to output_path.
    If Hindi and not in Devanagari, it transliterates for better pronunciation.
    """
    if language.lower() in ["hi", "hi-in"]:
        try:
            from indic_transliteration.sanscript import transliterate, ITRANS, DEVANAGARI
            import re
            devanagari_regex = r"[\u0900-\u097F]"
            if not re.search(devanagari_regex, text):
                logging.info(f"[TTS] Input text (pre-transliteration): {text}")
                text = transliterate(text, ITRANS, DEVANAGARI)
                logging.info(f"[TTS] Transliterated to Devanagari: {text}")
        except Exception as e:
            logging.error(f"[TTS] Transliteration failed: {e}")
    try:
        response = client.text_to_speech.convert(
            text=text,
            target_language_code=language,  # e.g., "hi-IN"
            speaker="abhilash",             # Use the specific Sarvam voice
            pitch=0,
            pace=1,
            loudness=1,
            speech_sample_rate=22050,
            enable_preprocessing=True,
            model="bulbul:v2"
        )
        if response and hasattr(response, 'audios') and response.audios:
            audio_data = response.audios[0]
            if isinstance(audio_data, str):
                import base64
                audio_data = base64.b64decode(audio_data)
            with open(output_path, "wb") as f:
                f.write(audio_data)
            return output_path
        else:
            logging.error("No audio returned from Sarvam SDK.")
            raise Exception("Empty audio response.")
    except Exception as e:
        logging.error(f"[TTS] Sarvam SDK failed: {e}")
        raise

import asyncio
async def tts_sarvam(text, language, output_path):
    return await asyncio.to_thread(_tts_sarvam_sync, text, language, output_path)


SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_API_URL = os.getenv("SARVAM_API_URL", "https://api.sarvam.ai/text-to-speech")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default voice

async def tts_elevenlabs(text, output_path):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        with open(output_path, "wb") as f:
            f.write(response.content)
    return output_path

async def stt_sarvam(audio_path, language):
    """
    Send audio file to Sarvam AI /speech-to-text endpoint and return Hindi transcript string.
    """
    import logging
    SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
    ASR_URL = "https://api.sarvam.ai/speech-to-text"
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
    }
    files = {
        'file': (os.path.basename(audio_path), open(audio_path, 'rb'), 'audio/wav'),
    }
    data = {
        'language': language,
        'task': 'transcribe'
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(ASR_URL, headers=headers, data=data, files=files)
            logging.info(f"[STT] Sarvam API status: {response.status_code}")
            logging.info(f"[STT] Sarvam API raw response: {response.text}")
            response.raise_for_status()
            result = response.json()
            transcript = result.get('transcript') or result.get('text', '')
            detected_lang = result.get('language_code', '')
            logging.info(f"[STT] Detected language: {detected_lang}")
            if not transcript:
                logging.error(f"[STT] Empty transcript. Full Sarvam response: {result}")
                return "[STT ERROR] Empty transcript. See logs for Sarvam API response."
            # Optionally, return transcript and detected language together
            return transcript
    except Exception as e:
        logging.error(f"[STT] Sarvam API exception: {e}")
        return f"[STT ERROR] Exception: {e}"