from dotenv import load_dotenv
import os

# Load .env file if present
load_dotenv()

# Groq settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_LLM_MODEL = os.getenv("GROQ_LLM_MODEL", "llama-3.3-70b-versatile")

# Chroma (vector DB)
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

# Sentence Transformer model
SENTENCE_TRANSFORMER_MODEL = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")

# Client URL for CORS and origin validation
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")

# JWT Secret Key
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production-use-32-characters")


# Optional: verify critical vars (don't raise here so app can still start in dev)
if not GROQ_API_KEY:
    # It's fine to warn; the actual call will raise if key is missing when used
    print("⚠️  GROQ_API_KEY not set. Set it in your .env or environment variables.")
