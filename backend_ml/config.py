import os
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Global config for ML API
class Config:
    ML_API_PORT = int(os.getenv("ML_API_PORT", 8000))
    SENTIMENT_MODEL = os.getenv("SENTIMENT_MODEL", "distilbert-base-uncased-finetuned-sst-2-english")
    EMBEDDER_MODEL = os.getenv("EMBEDDER_MODEL", "all-MiniLM-L6-v2")
    
    # API Routes
    HEALTH_ROUTE = os.getenv("HEALTH_ROUTE", "/health")
    ANALYZE_ROUTE = os.getenv("ANALYZE_ROUTE", "/analyze")
    FINALIZE_ROUTE = os.getenv("FINALIZE_ROUTE", "/finalize")
    
    # Scoring Configuration
    MIN_SCORE = int(os.getenv("MIN_SCORE", 0))
    MAX_SCORE = int(os.getenv("MAX_SCORE", 100))
    SENTIMENT_WEIGHT = float(os.getenv("SENTIMENT_WEIGHT", 0.25))
    CLARITY_WEIGHT = float(os.getenv("CLARITY_WEIGHT", 0.25))
    VOCABULARY_WEIGHT = float(os.getenv("VOCABULARY_WEIGHT", 0.25))
    LENGTH_WEIGHT = float(os.getenv("LENGTH_WEIGHT", 0.25))
