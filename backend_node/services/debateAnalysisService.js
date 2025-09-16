// services/debateAnalysisService.js
// Centralized debate analysis - JavaScript version for backend use

// Enhanced Analysis Functions
const calculateCoherence = (text) => {
  const flowWords = ['because', 'therefore', 'however', 'furthermore', 'additionally', 'consequently'];
  const flowCount = flowWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 60 + (flowCount * 5);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) score += 10;
  
  return Math.min(100, Math.max(30, score));
};

const calculateEvidence = (text) => {
  const evidenceWords = ['study', 'research', 'data', 'statistics', 'evidence', 'survey', 'report'];
  const evidenceCount = evidenceWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (evidenceCount * 10);
  if (/\d+%|\d+\.\d+%/.test(text)) score += 15;
  if (/according to|studies show|research indicates/.test(text.toLowerCase())) score += 20;
  
  return Math.min(100, Math.max(20, score));
};

const calculateLogic = (text) => {
  const logicalWords = ['if', 'then', 'because', 'since', 'given that', 'assuming'];
  const logicalCount = logicalWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 55 + (logicalCount * 8);
  if (/however|although|despite|while/.test(text.toLowerCase())) score += 15;
  
  return Math.min(100, Math.max(25, score));
};

const calculatePersuasiveness = (text, topic) => {
  const persuasiveWords = ['should', 'must', 'important', 'crucial', 'essential', 'urgent'];
  const persuasiveCount = persuasiveWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (persuasiveCount * 7);
  if (/significant|critical|vital|devastating|beneficial/.test(text.toLowerCase())) score += 10;
  if (topic && text.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) score += 15;
  
  return Math.min(100, Math.max(30, score));
};

const rateScore = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  if (score >= 50) return "Below Average";
  return "Poor";
};

const generateStrengths = (coherence, evidence, logic, persuasiveness) => {
  const strengths = [];
  if (coherence >= 70) strengths.push("Clear and coherent arguments");
  if (evidence >= 70) strengths.push("Strong supporting evidence");
  if (logic >= 70) strengths.push("Sound logical reasoning");
  if (persuasiveness >= 70) strengths.push("Compelling and persuasive");
  
  if (strengths.length === 0) strengths.push("Shows engagement in the debate");
  return strengths;
};

const generateWeaknesses = (coherence, evidence, logic, persuasiveness) => {
  const weaknesses = [];
  if (coherence < 60) weaknesses.push("Could improve logical flow between points");
  if (evidence < 60) weaknesses.push("Would benefit from more supporting evidence");
  if (logic < 60) weaknesses.push("Logical reasoning could be strengthened");
  if (persuasiveness < 60) weaknesses.push("Arguments could be more compelling");
  
  return weaknesses;
};

const generateFeedback = (score) => {
  if (score >= 85) return "Excellent argumentation with strong logical structure and evidence";
  if (score >= 70) return "Good arguments with room for minor improvements";
  if (score >= 55) return "Decent arguments that could benefit from better structure or evidence";
  return "Arguments need significant improvement in logic, evidence, or structure";
};

const analyzeUserArguments = (userArgs, topic) => {
  const argTexts = userArgs.map(arg => arg.content || arg.argumentText || '').join(' ');
  
  const coherenceScore = calculateCoherence(argTexts);
  const evidenceScore = calculateEvidence(argTexts);
  const logicScore = calculateLogic(argTexts);
  const persuasivenessScore = calculatePersuasiveness(argTexts, topic);
  
  const total = Math.round((coherenceScore + evidenceScore + logicScore + persuasivenessScore) / 4);
  
  return {
    scores: {
      sentiment: { score: persuasivenessScore, rating: rateScore(persuasivenessScore) },
      clarity: { score: coherenceScore, rating: rateScore(coherenceScore) },
      vocab_richness: { score: evidenceScore, rating: rateScore(evidenceScore) },
      avg_word_len: { score: logicScore, rating: rateScore(logicScore) },
      coherence: coherenceScore,
      evidence: evidenceScore,
      logic: logicScore,
      persuasiveness: persuasivenessScore
    },
    total,
    argumentCount: userArgs.length,
    averageLength: Math.round(argTexts.length / userArgs.length) || 0,
    analysis: {
      strengths: generateStrengths(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      weaknesses: generateWeaknesses(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      feedback: generateFeedback(total)
    }
  };
};

// Main analysis function
export const analyzeDebateForBackend = async (argumentsArray, topic) => {
  console.log('🤖 Using centralized debate analysis for topic:', topic);
  
  try {
    // Try ML API first
    if (process.env.DEBATE_ML_URL) {
      try {
        const mlResult = await fetch(`${process.env.DEBATE_ML_URL}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arguments: argumentsArray, topic }),
        });
        
        if (mlResult.ok) {
          const result = await mlResult.json();
          console.log('✅ ML evaluation');
          return {
            ...result,
            analysisSource: 'ml',
            finalizedAt: new Date()
          };
        }
        console.warn('⚠️ ML evaluation failed');
      } catch (mlErr) {
        console.warn('⚠️ ML service unavailable:', mlErr);
      }
    }

    // Enhanced local analysis
    console.log('📊 Using enhanced local analysis');
    const usernames = [...new Set(argumentsArray.map(arg => arg.username))];
    const results = {};

    for (const username of usernames) {
      const userArgs = argumentsArray.filter(arg => arg.username === username);
      results[username] = analyzeUserArguments(userArgs, topic);
    }

    // Determine winner
    const winner = Object.entries(results).reduce((prev, current) => 
      current[1].total > prev[1].total ? current : prev
    )[0];

    return {
      results,
      winner,
      analysisSource: 'enhanced_local',
      finalizedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Centralized analysis failed:', error);
    throw error;
  }
};

export default {
  analyzeDebateForBackend,
  analyzeUserArguments,
  calculateCoherence,
  calculateEvidence,
  calculateLogic,
  calculatePersuasiveness
};