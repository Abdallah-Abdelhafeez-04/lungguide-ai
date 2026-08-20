from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-3.5-flash"
    gemini_embedding_model: str = "gemini-embedding-2"

    retrieval_top_k: int = 5
    min_relevance_score: float = 0.28
    chunk_size: int = 800
    chunk_overlap: int = 120

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173"

    @property
    def base_dir(self) -> Path:
        return Path(__file__).resolve().parents[1]

    @property
    def data_dir(self) -> Path:
        return self.base_dir / "data"

    @property
    def documents_dir(self) -> Path:
        return self.data_dir / "documents"

    @property
    def chroma_dir(self) -> Path:
        return self.data_dir / "chroma"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
