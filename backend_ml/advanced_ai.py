# advanced_ai.py - Advanced AI features for debate analysis
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer
import torch
from typing import List, Dict, Any
import re
from collections import Counter

class AdvancedDebateAnalyzer:
    def __init__(self):
        self.emotion_classifier = None
        self.topic_classifier = None
        self.sentence_model = None
        self.tokenizer = None
        self.model = None
        
    def init_models(self):
        """Initialize all AI models"""
        try:
            # Emotion analysis
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Topic classification
            self.topic_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Sentence embeddings for similarity
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            print("✅ Advanced AI models initialized successfully")
        except Exception as e:
            print(f"⚠️ Error initializing advanced models: {e}")
    
    def analyze_argument_emotion(self, text: str) -> Dict[str, Any]:
        """Analyze emotional content of an argument"""
        try:
            if not self.emotion_classifier:
                return {"emotion": "neutral", "confidence": 0.5, "emotions": []}
            
            result = self.emotion_classifier(text)
            emotions = sorted(result, key=lambda x: x['score'], reverse=True)
            
            return {
                "emotion": emotions[0]['label'],
                "confidence": emotions[0]['score'],
                "emotions": emotions[:3]  # Top 3 emotions
            }
        except Exception as e:
            print(f"Error in emotion analysis: {e}")
            return {"emotion": "neutral", "confidence": 0.5, "emotions": []}
    
    def classify_argument_topic(self, text: str, candidate_topics: List[str]) -> Dict[str, Any]:
        """Classify argument into predefined topics"""
        try:
            if not self.topic_classifier:
                return {"topic": "general", "confidence": 0.5, "scores": []}
            
            result = self.topic_classifier(text, candidate_topics)
            
            return {
                "topic": result['labels'][0],
                "confidence": result['scores'][0],
                "scores": list(zip(result['labels'], result['scores']))
            }
        except Exception as e:
            print(f"Error in topic classification: {e}")
            return {"topic": "general", "confidence": 0.5, "scores": []}
    
    def analyze_argument_structure(self, text: str) -> Dict[str, Any]:
        """Analyze the logical structure of an argument"""
        # Simple heuristic-based analysis
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Look for logical connectors
        connectors = {
            'evidence': ['because', 'since', 'due to', 'evidence shows', 'studies indicate'],
            'conclusion': ['therefore', 'thus', 'hence', 'in conclusion', 'as a result'],
            'contrast': ['however', 'but', 'nevertheless', 'on the other hand', 'despite'],
            'support': ['furthermore', 'moreover', 'additionally', 'also', 'in addition']
        }
        
        structure_elements = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for element_type, keywords in connectors.items():
                if any(keyword in sentence_lower for keyword in keywords):
                    structure_elements.append({
                        'type': element_type,
                        'sentence': sentence,
                        'keywords_found': [kw for kw in keywords if kw in sentence_lower]
                    })
                    break
            else:
                structure_elements.append({
                    'type': 'statement',
                    'sentence': sentence,
                    'keywords_found': []
                })
        
        return {
            'sentence_count': len(sentences),
            'structure_elements': structure_elements,
            'has_evidence': any(elem['type'] == 'evidence' for elem in structure_elements),
            'has_conclusion': any(elem['type'] == 'conclusion' for elem in structure_elements),
            'logical_flow_score': self._calculate_logical_flow_score(structure_elements)
        }
    
    def _calculate_logical_flow_score(self, elements: List[Dict]) -> float:
        """Calculate a score for logical flow based on argument structure"""
        if not elements:
            return 0.0
        
        score = 0.0
        element_types = [elem['type'] for elem in elements]
        
        # Bonus for having evidence
        if 'evidence' in element_types:
            score += 0.3
        
        # Bonus for having conclusion
        if 'conclusion' in element_types:
            score += 0.2
        
        # Bonus for logical progression
        if element_types.count('statement') > 0:
            score += 0.2
        
        # Bonus for using contrasts appropriately
        if 'contrast' in element_types:
            score += 0.1
        
        # Bonus for supporting statements
        if 'support' in element_types:
            score += 0.2
        
        return min(score, 1.0)
    
    def calculate_argument_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two arguments"""
        try:
            if not self.sentence_model:
                return 0.0
            
            embeddings = self.sentence_model.encode([text1, text2])
            similarity = np.dot(embeddings[0], embeddings[1]) / (
                np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
            )
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def analyze_debate_dynamics(self, arguments: List[Dict]) -> Dict[str, Any]:
        """Analyze overall debate dynamics and patterns"""
        if not arguments:
            return {}
        
        # Analyze emotional progression
        emotions = []
        topics = []
        similarities = []
        
        for i, arg in enumerate(arguments):
            emotion_result = self.analyze_argument_emotion(arg['content'])
            emotions.append(emotion_result['emotion'])
            
            # Calculate similarity with previous arguments
            if i > 0:
                similarity = self.calculate_argument_similarity(
                    arguments[i-1]['content'], 
                    arg['content']
                )
                similarities.append(similarity)
        
        # Analyze emotional flow
        emotion_counts = Counter(emotions)
        emotional_diversity = len(emotion_counts) / len(emotions) if emotions else 0
        
        # Calculate average similarity (how repetitive the debate is)
        avg_similarity = np.mean(similarities) if similarities else 0
        
        return {
            'total_arguments': len(arguments),
            'emotional_diversity': emotional_diversity,
            'dominant_emotions': emotion_counts.most_common(3),
            'average_similarity': avg_similarity,
            'debate_coherence': 1 - avg_similarity,  # Lower similarity = more diverse ideas
            'emotional_progression': emotions
        }
    
    def generate_argument_feedback(self, text: str, score: float) -> Dict[str, Any]:
        """Generate constructive feedback for an argument"""
        emotion_analysis = self.analyze_argument_emotion(text)
        structure_analysis = self.analyze_argument_structure(text)
        
        feedback = {
            'overall_score': score,
            'strengths': [],
            'improvements': [],
            'emotion_feedback': emotion_analysis,
            'structure_feedback': structure_analysis
        }
        
        # Generate specific feedback based on analysis
        if structure_analysis['has_evidence']:
            feedback['strengths'].append("Good use of evidence to support your points")
        else:
            feedback['improvements'].append("Consider adding evidence or examples to strengthen your argument")
        
        if structure_analysis['has_conclusion']:
            feedback['strengths'].append("Clear conclusion that ties your argument together")
        else:
            feedback['improvements'].append("Try ending with a strong concluding statement")
        
        if structure_analysis['logical_flow_score'] > 0.7:
            feedback['strengths'].append("Excellent logical structure and flow")
        elif structure_analysis['logical_flow_score'] > 0.4:
            feedback['strengths'].append("Good logical structure")
        else:
            feedback['improvements'].append("Work on creating a more logical flow between your points")
        
        if emotion_analysis['confidence'] > 0.8:
            if emotion_analysis['emotion'] in ['joy', 'optimism']:
                feedback['strengths'].append("Positive and engaging tone")
            elif emotion_analysis['emotion'] in ['anger', 'disgust']:
                feedback['improvements'].append("Consider using a more neutral tone to strengthen your argument")
        
        return feedback
    
    def suggest_counter_arguments(self, argument_text: str, debate_topic: str) -> List[str]:
        """Suggest potential counter-arguments (basic implementation)"""
        # This is a simplified version - in practice, you'd want more sophisticated NLP
        suggestions = []
        
        # Look for absolute statements that can be challenged
        if any(word in argument_text.lower() for word in ['always', 'never', 'all', 'none', 'every']):
            suggestions.append("Challenge absolute statements with exceptions or edge cases")
        
        # Look for causal claims
        if any(word in argument_text.lower() for word in ['because', 'causes', 'leads to', 'results in']):
            suggestions.append("Question the causal relationship - are there other factors involved?")
        
        # Look for statistical claims
        if any(char.isdigit() for char in argument_text) or 'percent' in argument_text.lower():
            suggestions.append("Ask for sources and context for statistical claims")
        
        # Generic suggestions based on common debate strategies
        suggestions.extend([
            "Present alternative perspectives or interpretations",
            "Ask for evidence to support key claims",
            "Highlight potential negative consequences",
            "Draw on relevant examples or case studies"
        ])
        
        return suggestions[:3]  # Return top 3 suggestions
