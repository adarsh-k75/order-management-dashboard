from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    SECRET_KEY: str = "38e3e4a9e525ad2a25ff0f11de8c3be3dfcb469123bde874e0d9b4db9a099aa5"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "postgresql://postgres:postgres123@localhost:5432/order_management"

    # Pydantic Configuration to read from .env files
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
