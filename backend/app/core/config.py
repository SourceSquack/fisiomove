from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, PostgresDsn, field_validator, AliasChoices, Field
from typing import List, Optional, Any
import os


class Settings(BaseSettings):
    # Resolver ruta de .env independientemente del cwd
    _BASE_DIR = Path(__file__).resolve().parents[2]  # .../backend
    model_config = SettingsConfigDict(
        env_file=(
            str(_BASE_DIR / ".env"),
            str(_BASE_DIR / ".env.local"),
            ".env",
            ".env.local",
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    PROJECT_NAME: str = "FisioMove API"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENV: str = Field(default="development")  # development | staging | production

    # CORS - Configuración más amplia para desarrollo
    CORS_ORIGINS: List[AnyHttpUrl] | List[str] = [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202",
        "http://localhost:4203",
        "http://localhost:3000",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
        "http://127.0.0.1:4202",
        "http://127.0.0.1:4203",
        "http://127.0.0.1:3000",
        "*",  # Permitir todos los orígenes en desarrollo
    ]

    # Database (puede omitirse si no se usa)
    DATABASE_URL: Optional[PostgresDsn | str] = None

    # Security
    SECRET_KEY: str = "CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    JWT_ALGORITHM: str = "HS256"

    # Supabase Configuration
    SUPABASE_PROJECT_NAME: str | None = None
    SUPABASE_URL: AnyHttpUrl = Field(
        validation_alias=AliasChoices(
            "SUPABASE_URL", "SUPABASE_PROJECT_URL", "NEXT_PUBLIC_SUPABASE_URL"
        )
    )
    SUPABASE_API_KEY: str = Field(
        validation_alias=AliasChoices(
            "SUPABASE_API_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )
    )
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_SERVICE_ROLE",
            "SERVICE_ROLE_KEY",
            "SUPABASE_SERVICE_KEY",
        ),
    )
    SUPABASE_PASSWORD: Optional[str] = None

    # Dev-only: bypass email confirmation for selected users
    DEV_BYPASS_EMAIL_CONFIRM: bool = True
    DEV_BYPASS_EMAILS: str = ""  # CSV en .env (p.ej. admin@x.com,user@y.com)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
