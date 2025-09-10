import numpy as np
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import threading
from config import Config

class DebateJudge:
    """
    DebateJudge evaluates arguments and debates with:
    - Sentiment scoring (percentage)
    - Clarity analysis (percentage + penalty for filler/run-ons)
    - Vocabulary richness (unique word ratio %)
    - Avg word length (as a score)
    - Semantic coherence (between both debaters)
    - Weighted debate evaluation
    """

    def __init__(self, device=None):
        """
        device: 'cuda' or 'cpu' (default None = auto detect)
        """
        self.device = device
        self._init_lock = threading.Lock()
        self._initialized = False

    def init_models(self):
        """Initialize ML models only once (thread-safe)."""
        with self._init_lock:
            if self._initialized:
                return
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model=Config.SENTIMENT_MODEL
            )
            self.embedder = SentenceTransformer(Config.EMBEDDER_MODEL)
            self._initialized = True
            print("✅ ML models loaded successfully")

    @staticmethod
    def _rating(value: float) -> str:
        """Map percentage to a descriptive rating."""
        if value >= 85: return "Excellent"
        if value >= 70: return "Good"
        if value >= 50: return "Fair"
        return "Poor"

    def score_argument(self, text: str) -> dict:
        """Score a single argument with descriptive percentages (0-100 scale)."""
        if not self._initialized:
            self.init_models()

        text = text or ""
        if not text.strip():
            return {
                "sentiment": {"score": 0, "rating": "Poor"},
                "clarity": {"score": 0, "rating": "Poor"},
                "vocab_richness": {"score": 0, "rating": "Poor"},
                "avg_word_len": {"score": 0, "rating": "Poor"},
                "length": 0
            }

        # --- Sentiment ---
        try:
            r = self.sentiment_analyzer(text[:512])[0]
            sentiment_score = r["score"] if r["label"].upper() == "POSITIVE" else -r["score"]
        except Exception:
            sentiment_score = 0.0
        sentiment_pct = round((sentiment_score + 1) * 50, 1)  # scale -1→1 → 0→100

        # --- Clarity ---
        filler = ["um", "uh", "like", "you know", "basically", "so"]
        lower = text.lower()
        filler_count = sum(lower.count(f) for f in filler)
        words = text.split()
        length = len(words)
        sentences = [s for s in text.replace("?", ".").replace("!", ".").split(".") if s.strip()]
        avg_wps = length / max(1, len(sentences))
        clarity_raw = 1.0 - min(1.0, filler_count / max(1, length))
        if avg_wps > 30:  # penalize run-on sentences
            clarity_raw *= 0.6
        clarity_pct = round(clarity_raw * 100, 1)

        # --- Vocabulary richness ---
        vocab_richness_raw = len(set([w.lower() for w in words])) / max(1, length)
        vocab_pct = round(vocab_richness_raw * 100, 1)

        # --- Average word length ---
        avg_word_len = float(np.mean([len(w) for w in words])) if words else 0.0
        avg_word_len_score = min(100, round(avg_word_len * 10, 1))  # normalized

        return {
            "sentiment": {"score": sentiment_pct, "rating": self._rating(sentiment_pct)},
            "clarity": {"score": clarity_pct, "rating": self._rating(clarity_pct)},
            "vocab_richness": {"score": vocab_pct, "rating": self._rating(vocab_pct)},
            "avg_word_len": {"score": avg_word_len_score, "rating": self._rating(avg_word_len_score)},
            "length": length
        }

    def compare_arguments(self, args_a, args_b) -> float:
        """Semantic similarity between arguments (0–100%)."""
        if not self._initialized:
            self.init_models()
        text_a = " ".join(args_a)
        text_b = " ".join(args_b)
        if not text_a.strip() or not text_b.strip():
            return 0.0
        emb_a = self.embedder.encode(text_a, convert_to_tensor=True)
        emb_b = self.embedder.encode(text_b, convert_to_tensor=True)
        sim = util.cos_sim(emb_a, emb_b).item()
        return round(sim * 100, 1)  # percentage

    def evaluate(self, args_a, args_b) -> dict:
        """Evaluate debate with descriptive percentage scores and winner."""
        if not self._initialized:
            self.init_models()

        scores_a = [self.score_argument(a) for a in args_a]
        scores_b = [self.score_argument(b) for b in args_b]
        metrics = ["sentiment", "clarity", "vocab_richness", "avg_word_len"]

        def avg_scores(scores):
            return {m: np.mean([s[m]["score"] for s in scores]) if scores else 0 for m in metrics}

        avg_a = avg_scores(scores_a)
        avg_b = avg_scores(scores_b)

        coherence = self.compare_arguments(args_a, args_b)

        def total_score(avg):
            return (0.3 * avg["clarity"] +
                    0.3 * avg["sentiment"] +
                    0.2 * avg["vocab_richness"] +
                    0.1 * avg["avg_word_len"] +
                    0.1 * coherence)

        total_a = round(total_score(avg_a), 1)
        total_b = round(total_score(avg_b), 1)
        winner = "A" if total_a >= total_b else "B"

        return {
            "scores": {
                "A": {m: {"score": round(avg_a[m], 1), "rating": self._rating(avg_a[m])} for m in metrics},
                "B": {m: {"score": round(avg_b[m], 1), "rating": self._rating(avg_b[m])} for m in metrics}
            },
            "coherence": {"score": coherence, "rating": self._rating(coherence)},
            "totals": {"A": total_a, "B": total_b},
            "winner": winner
        }
