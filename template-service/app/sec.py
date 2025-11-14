# app/config.py
from decouple import config
from pydantic_settings import BaseSettings
from .utils.database import normalize_url
from pydantic import PostgresDsn, field_validator
from typing import Optional

# normalized_db = normalize_url(config('DATABASE_URL'))
class Settings(BaseSettings):
    # 1. Add type hints (e.g., : str, : int)
    # Pydantic will automatically load these from the .env file.
    DATABASE_URL: PostgresDsn  # Use PostgresDsn for validation
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: Optional[str] = None

    # 2. Add the normalizer as a validator
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_db_url(cls, v):
        # This will run your normalize_url function on the value
        # that Pydantic reads from the .env file.
        return normalize_url(v)

    class Config:
        # Tell pydantic where to find your .env file
        env_file = "app/.env"
        env_file_encoding = "utf-8"

# Create the single settings instance
settings = Settings()

# class Settings(BaseSettings):
#     # From your task description
#     DATABASE_URL = normalized_db
#     REDIS_HOST = config('REDIS_HOST')
#     REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
#     REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

# settings = Settings()