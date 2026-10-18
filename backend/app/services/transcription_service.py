import asyncio
import logging
from pathlib import Path
from typing import Optional

from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)


class TranscriptionUnavailable(RuntimeError):
    pass


class TranscriptionService:
    """Loads Faster-Whisper once; reuses across requests.
    Inference runs in a thread pool so it never blocks the event loop."""

    def __init__(self, model_size: str, device: str, compute_type: str):
        self._model_size = model_size
        self._device = device
        self._compute_type = compute_type
        self._model: Optional[WhisperModel] = None
        self._lock = asyncio.Lock()

    async def load(self) -> None:
        async with self._lock:
            if self._model is not None:
                return
            try:
                self._model = await asyncio.to_thread(
                    WhisperModel,
                    self._model_size,
                    device=self._device,
                    compute_type=self._compute_type,
                )
                logger.info(
                    "Whisper model loaded: %s (%s/%s)",
                    self._model_size, self._device, self._compute_type,
                )
            except Exception as exc:
                logger.exception("Whisper model load failed")
                raise TranscriptionUnavailable("Model failed to load") from exc

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    async def transcribe(self, audio_path: Path, language: Optional[str]):
        if self._model is None:
            raise TranscriptionUnavailable("Model not loaded")

        def _run():
            segments, info = self._model.transcribe(
                str(audio_path),
                language=None if language in (None, "auto") else language,
                vad_filter=False,
            )
            text = " ".join(seg.text.strip() for seg in segments).strip()
            return text, info

        text, info = await asyncio.to_thread(_run)
        return {
            "text": text,
            "language": info.language,
            "language_probability": float(info.language_probability),
            "duration_seconds": float(info.duration),
        }