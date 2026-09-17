import os
from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def _path_from_env(name: str, default: str) -> Path:
    value = Path(os.getenv(name, default)).expanduser()
    return value.resolve() if value.is_absolute() else (BASE_DIR / value).resolve()


def _int_from_env(name: str, default: int, minimum: int = 1) -> int:
    value = int(os.getenv(name, str(default)))
    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}")
    return value


def _float_from_env(name: str, default: float, minimum: float = 0.0) -> float:
    value = float(os.getenv(name, str(default)))
    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}")
    return value


@dataclass(frozen=True)
class Settings:
    environment: str
    upload_dir: Path
    metadata_db_path: Path
    max_file_bytes: int
    max_pages: int
    max_text_chars: int
    max_chunks_per_document: int
    max_documents: int
    upload_retention_minutes: int
    cleanup_interval_seconds: int
    chunk_size_words: int
    chunk_overlap_words: int
    embedding_model: str
    max_question_chars: int
    max_context_chars: int
    max_output_tokens: int
    min_relevance_score: float
    generation_enabled: bool
    api_key: str
    cors_origins: tuple[str, ...]
    provider_timeout_seconds: float
    provider_max_retries: int
    parsing_timeout_seconds: float
    max_concurrent_generations: int
    requests_per_minute: int
    daily_generation_limit: int
    input_cost_per_million: float
    output_cost_per_million: float


def load_settings() -> Settings:
    environment = os.getenv("APP_ENV", "development").lower()
    if environment not in {"development", "test", "production"}:
        raise ValueError("APP_ENV must be development, test, or production")

    chunk_size = _int_from_env("CHUNK_SIZE_WORDS", 500)
    chunk_overlap = _int_from_env("CHUNK_OVERLAP_WORDS", 50, minimum=0)
    if chunk_overlap >= chunk_size:
        raise ValueError("CHUNK_OVERLAP_WORDS must be smaller than CHUNK_SIZE_WORDS")

    api_key = os.getenv("POCKET_RAG_API_KEY", "")
    if environment == "production" and not api_key:
        raise ValueError("POCKET_RAG_API_KEY is required in production")
    generation_enabled_default = "true" if environment == "development" else "false"

    data_dir = _path_from_env("DATA_DIR", "data")
    origins = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    )
    embedding_deployment = (
        os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
        or os.getenv("EMBEDDING_MODEL")
        or "text-embedding-3-small"
    )
    return Settings(
        environment=environment,
        upload_dir=_path_from_env("UPLOAD_DIR", str(data_dir / "uploads")),
        metadata_db_path=_path_from_env("METADATA_DB_PATH", str(data_dir / "metadata.sqlite3")),
        max_file_bytes=_int_from_env("MAX_FILE_BYTES", 10 * 1024 * 1024),
        max_pages=_int_from_env("MAX_PAGES", 200),
        max_text_chars=_int_from_env("MAX_TEXT_CHARS", 2_000_000),
        max_chunks_per_document=_int_from_env("MAX_CHUNKS_PER_DOCUMENT", 1000),
        max_documents=_int_from_env("MAX_DOCUMENTS", 100),
        upload_retention_minutes=_int_from_env("UPLOAD_RETENTION_MINUTES", 30),
        cleanup_interval_seconds=_int_from_env("CLEANUP_INTERVAL_SECONDS", 60),
        chunk_size_words=chunk_size,
        chunk_overlap_words=chunk_overlap,
        embedding_model=embedding_deployment,
        max_question_chars=_int_from_env("MAX_QUESTION_CHARS", 2000),
        max_context_chars=_int_from_env("MAX_CONTEXT_CHARS", 16000),
        max_output_tokens=_int_from_env("MAX_OUTPUT_TOKENS", 700),
        min_relevance_score=_float_from_env("MIN_RELEVANCE_SCORE", 0.2),
        generation_enabled=os.getenv("GENERATION_ENABLED", generation_enabled_default).lower()
        == "true",
        api_key=api_key,
        cors_origins=origins,
        provider_timeout_seconds=_float_from_env("PROVIDER_TIMEOUT_SECONDS", 30.0, 1.0),
        provider_max_retries=_int_from_env("PROVIDER_MAX_RETRIES", 1, minimum=0),
        parsing_timeout_seconds=_float_from_env("PARSING_TIMEOUT_SECONDS", 15.0, 1.0),
        max_concurrent_generations=_int_from_env("MAX_CONCURRENT_GENERATIONS", 2),
        requests_per_minute=_int_from_env("REQUESTS_PER_MINUTE", 10),
        daily_generation_limit=_int_from_env("DAILY_GENERATION_LIMIT", 200),
        input_cost_per_million=_float_from_env("INPUT_COST_PER_MILLION_USD", 0.15),
        output_cost_per_million=_float_from_env("OUTPUT_COST_PER_MILLION_USD", 0.60),
    )
