"""Application configuration using pydantic-settings for 12-factor app compliance."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # App
    APP_NAME: str = "Route53 Clone API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./route53.db"

    # JWT
    SECRET_KEY: str = "super-secret-key-change-in-production-please-use-random-256-bits"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Rate limiting (requests per minute)
    RATE_LIMIT_RPM: int = 120


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
