from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SkyIntel AI API"
    environment: str = "development"
    database_url: str = "sqlite:///./rain_predictor.db"
    secret_key: str = "change-this-secret-key-before-production-32bytes"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openweather_api_key: str = ""
    frontend_origin: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1"
    log_level: str = "INFO"
    allowed_hosts: str = "localhost,127.0.0.1,testserver,*"

    model_config = SettingsConfigDict(
        env_file=(".env", "_local_config/.env", "_local_env/.env"),
        extra="ignore",
        case_sensitive=False
    )

    @field_validator("secret_key")
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters long.")
        return value

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.environment.lower() == "production" and self.secret_key == "change-this-secret-key-before-production":
            raise ValueError("SECRET_KEY must be changed before starting in production.")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]

    @property
    def trusted_hosts(self) -> list[str]:
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
