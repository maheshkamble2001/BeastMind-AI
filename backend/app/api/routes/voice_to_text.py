import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.config import Settings, get_settings
from app.services.transcription_service import (
    TranscriptionService,
    TranscriptionUnavailable,
)

router = APIRouter(prefix="/voice-to-text", tags=["voice-to-text"])

SUPPORTED_LANGUAGES = {
    "auto": "Auto-detect",
    "mr": "Marathi",
    "hi": "Hindi",
    "en": "English",
}


def get_service() -> TranscriptionService:
    from app.main import transcription_service
    return transcription_service


@router.get("/languages")
def languages():
    return {"languages": [
        {"code": c, "label": l} for c, l in SUPPORTED_LANGUAGES.items()
    ]}


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form("auto"),
    settings: Settings = Depends(get_settings),
    service: TranscriptionService = Depends(get_service),
):
    print(f"Received audio file: {audio.filename}, language: {language}")
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(422, f"Unsupported language: {language}")
    if not service.is_ready:
        raise HTTPException(503, "Transcription service unavailable")

    max_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
    tmp_path = Path(settings.TEMP_AUDIO_DIR) / f"{uuid.uuid4().hex}.bin"
    total = 0
    try:
        with tmp_path.open("wb") as out:
            while chunk := await audio.read(1 << 20):
                total += len(chunk)
                if total > max_bytes:
                    raise HTTPException(413, "Audio file too large")
                out.write(chunk)
        if total == 0:
            raise HTTPException(400, "Empty audio upload")

        try:
            result = await service.transcribe(tmp_path, language)
            print(f"Transcription result: {result}")
        except TranscriptionUnavailable as e:
            raise HTTPException(503, str(e))
        except Exception:
            raise HTTPException(500, "Transcription failed")

        if not result["text"]:
            raise HTTPException(400, "No speech detected in audio")

        return {"success": True, **result}
    finally:
        tmp_path.unlink(missing_ok=True)
        await audio.close()