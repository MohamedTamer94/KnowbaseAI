from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LLM / AI
    GROQ_API_KEY: str
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"

    # Vector DB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000

    # Postgres
    DATABASE_URL: str

    # Embeddings
    SENTENCE_TRANSFORMER_MODEL: str = "all-MiniLM-L6-v2"

    # Frontend / CORS
    CLIENT_URL: str = "http://localhost:5173"

    # Auth
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production-use-32-characters"

    # Optional environment
    ENV: str = "development"

    class Config:
        env_file = ".env"  # single env file at project root
        env_file_encoding = "utf-8"

# Create a global settings object
settings = Settings()
