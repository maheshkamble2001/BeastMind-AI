import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, voice_to_text
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.services.transcription_service import TranscriptionService

configure_logging()
logger = logging.getLogger("beastmind")

transcription_service: TranscriptionService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global transcription_service
    s = get_settings()
    transcription_service = TranscriptionService(
        s.WHISPER_MODEL_SIZE, s.WHISPER_DEVICE, s.WHISPER_COMPUTE_TYPE,
    )
    try:
        await transcription_service.load()
    except Exception:
        logger.exception("Startup model load failed; /transcribe will return 503")
    yield


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.APP_NAME, version=s.APP_VERSION, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[s.FRONTEND_ORIGIN],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router, prefix="/api")
    app.include_router(voice_to_text.router, prefix="/api")
    return app


app = create_app()