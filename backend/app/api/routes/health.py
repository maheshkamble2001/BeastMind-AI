from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    s = get_settings()
    from app.main import transcription_service
    ready = bool(transcription_service and transcription_service.is_ready)
    return {
        "status": "ok" if ready else "degraded",
        "application": s.APP_NAME,
        "version": s.APP_VERSION,
        "model_ready": ready,
    }