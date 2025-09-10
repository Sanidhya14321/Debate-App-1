from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback
from ml_judge import DebateJudge
from advanced_ai import AdvancedDebateAnalyzer
from config import Config

# FastAPI app
app = FastAPI(title="Debate ML API", version="1.0")

# Enable CORS with proper security
allowed_origins = [
    "http://localhost:3000",  # Frontend dev server
    "http://localhost:5000",  # Backend server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# Initialize Judge and Advanced AI
judge = DebateJudge()
advanced_ai = AdvancedDebateAnalyzer()

try:
    judge.init_models()
    advanced_ai.init_models()
except Exception as e:
    print("⚠️ Model warmup failed:", e)


# ------------------- Request Schemas -------------------
class AnalyzeRequest(BaseModel):
    text: str

class AdvancedAnalysisRequest(BaseModel):
    text: str
    debate_topic: str = ""
    previous_arguments: list = []

class FeedbackRequest(BaseModel):
    text: str
    score: float


class FinalizeRequest(BaseModel):
    arguments: list[dict]  # [{username, argumentText}, ...]


# ------------------- Routes -------------------
@app.post(Config.ANALYZE_ROUTE)
def analyze(req: AnalyzeRequest):
    """Analyze a single argument."""
    try:
        if not req.text.strip():
            return {"error": "No text provided"}
        scores = judge.score_argument(req.text)
        return {"score": scores}
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.post(Config.FINALIZE_ROUTE)
async def finalize_debate(request: FinalizeRequest):
    """Finalize debate and determine winner"""
    try:
        result = judge.finalize_debate(request.arguments)
        
        # Add advanced analysis
        if advanced_ai.sentence_model:
            dynamics = advanced_ai.analyze_debate_dynamics(request.arguments)
            result["debate_dynamics"] = dynamics
        
        return result
    except Exception as e:
        print("Error in finalize_debate:", traceback.format_exc())
        return {"error": str(e)}


@app.post("/advanced-analysis")
async def advanced_analysis(request: AdvancedAnalysisRequest):
    """Perform advanced AI analysis on an argument"""
    try:
        result = {}
        
        # Emotion analysis
        emotion_result = advanced_ai.analyze_argument_emotion(request.text)
        result["emotion_analysis"] = emotion_result
        
        # Structure analysis
        structure_result = advanced_ai.analyze_argument_structure(request.text)
        result["structure_analysis"] = structure_result
        
        # Topic classification if debate topic provided
        if request.debate_topic:
            topics = [request.debate_topic, "general", "politics", "technology", "society", "ethics"]
            topic_result = advanced_ai.classify_argument_topic(request.text, topics)
            result["topic_analysis"] = topic_result
        
        # Similarity with previous arguments
        if request.previous_arguments:
            similarities = []
            for prev_arg in request.previous_arguments[-3:]:  # Last 3 arguments
                similarity = advanced_ai.calculate_argument_similarity(
                    request.text, prev_arg.get('content', '')
                )
                similarities.append({
                    "argument_id": prev_arg.get('id', ''),
                    "similarity": similarity
                })
            result["similarity_analysis"] = similarities
        
        # Counter-argument suggestions
        if request.debate_topic:
            suggestions = advanced_ai.suggest_counter_arguments(request.text, request.debate_topic)
            result["counter_suggestions"] = suggestions
        
        return result
    except Exception as e:
        print("Error in advanced analysis:", traceback.format_exc())
        return {"error": str(e)}


@app.post("/feedback")
async def generate_feedback(request: FeedbackRequest):
    """Generate constructive feedback for an argument"""
    try:
        feedback = advanced_ai.generate_argument_feedback(request.text, request.score)
        return feedback
    except Exception as e:
        print("Error generating feedback:", traceback.format_exc())
        return {"error": str(e)}


@app.get(Config.HEALTH_ROUTE)
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": judge.model is not None,
        "advanced_ai_loaded": advanced_ai.sentence_model is not None,
        "timestamp": "2024-01-01T00:00:00Z"
    }


# ------------------- Entry -------------------
if __name__ == "__main__":
    import uvicorn
    # Local development only
    print(f"🚀 Starting ML API server on port {Config.ML_API_PORT}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=Config.ML_API_PORT,
        reload=True   # Auto-reload for local dev
    )