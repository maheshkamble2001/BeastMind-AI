from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "BeastMind AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    WHISPER_MODEL_SIZE: str = "small"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"
    MAX_AUDIO_SIZE_MB: int = 25
    TEMP_AUDIO_DIR: str = "tmp_audio"


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    Path(s.TEMP_AUDIO_DIR).mkdir(parents=True, exist_ok=True)
    return s