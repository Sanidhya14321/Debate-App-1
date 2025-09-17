// services/debateAnalysisService.js
// Backend integration with frontend debate-analysis.ts flow

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main analysis function - calls frontend debate-analysis.ts
export const analyzeDebateForBackend = async (argumentsArray, topic) => {
  console.log('🤖 Using frontend debate-analysis.ts flow for topic:', topic);
  
  try {
    // Call the frontend debate-analysis.ts via Node.js subprocess
    const frontendPath = path.resolve(__dirname, '../../frontend');
    const analysisScript = path.join(frontendPath, 'ai/flows/debate-analysis.ts');
    
    console.log('🔬 Calling frontend debate analysis service...');
    
    // Create input data that matches frontend schema
    const inputData = {
      arguments: argumentsArray.map(arg => ({
        username: arg.username,
        argumentText: arg.content || arg.argumentText || '',
        content: arg.content || arg.argumentText || '',
        timestamp: arg.timestamp?.toISOString?.() || new Date().toISOString(),
        userId: arg.userId
      })),
      topic
    };

    // For now, we'll use a simple HTTP call to the frontend analysis endpoint
    // In production, you might want to set up a proper service communication
    
    // Try to call frontend service via HTTP if available
    if (process.env.FRONTEND_URL) {
      try {
        const response = await fetch(`${process.env.FRONTEND_URL}/api/analyze-debate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputData),
          timeout: 10000
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Frontend analysis completed via HTTP');
          return result;
        }
      } catch (httpErr) {
        console.warn('⚠️ Frontend HTTP call failed:', httpErr.message);
      }
    }

    // Fallback to direct import (requires transpilation)
    try {
      // For Node.js environment, we need to implement the same logic
      // Since we can't directly import TypeScript in Node.js backend
      return await performDirectAnalysis(inputData);
    } catch (directErr) {
      console.error('❌ Direct analysis failed:', directErr.message);
      throw new Error('All analysis methods failed');
    }

  } catch (error) {
    console.error('❌ Frontend analysis service failed:', error);
    throw error;
  }
};

// Direct implementation matching frontend debate-analysis.ts logic
const performDirectAnalysis = async (inputData) => {
  console.log('📊 Performing direct analysis (matching frontend logic)');
  
  const { arguments: argumentsArray, topic } = inputData;
  
  // Normalize input arguments
  const normalizedArgs = argumentsArray.map(arg => ({
    username: arg.username,
    argumentText: arg.argumentText || arg.content || '',
    content: arg.content || arg.argumentText || '',
    timestamp: arg.timestamp,
    userId: arg.userId
  }));

  // --- Step 1: ML API (if available) ---
  if (process.env.DEBATE_ML_URL) {
    try {
      console.log('🔬 Attempting ML API analysis...');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const mlResult = await fetch(`${process.env.DEBATE_ML_URL}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arguments: normalizedArgs, topic }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (mlResult.ok) {
        const result = await mlResult.json();
        console.log('✅ ML evaluation completed');
        return {
          ...result,
          analysisSource: 'ml',
          finalizedAt: new Date()
        };
      }
      console.warn('⚠️ ML evaluation failed with status:', mlResult.status);
    } catch (mlErr) {
      console.warn('⚠️ ML service unavailable:', mlErr.message);
    }
  }

  // --- Step 2: AI Fallback (Gemini) ---
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🤖 Attempting AI analysis fallback...');
      const aiResult = await performAIAnalysis(normalizedArgs, topic);
      if (aiResult) {
        console.log('✅ AI evaluation completed');
        return {
          ...aiResult,
          analysisSource: 'ai',
          finalizedAt: new Date()
        };
      }
    } catch (aiErr) {
      console.warn('⚠️ AI analysis failed:', aiErr.message);
    }
  }

  // --- Step 3: Enhanced Local Analysis ---
  console.log('📊 Using enhanced local analysis');
  const usernames = [...new Set(normalizedArgs.map(arg => arg.username))];
  const results = {};

  for (const username of usernames) {
    const userArgs = normalizedArgs.filter(arg => arg.username === username);
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
};

// Enhanced Analysis Functions (matching frontend logic exactly)
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
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
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
  const argTexts = userArgs.map(arg => arg.argumentText || arg.content || '').join(' ');
  
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

// AI Analysis using Gemini (matching frontend prompt)
const performAIAnalysis = async (argumentsArray, topic) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not available');
  }

  const argsString = argumentsArray
    .map(a => `**${a.username}**: ${a.argumentText}`)
    .join('\n\n');

  const prompt = `
You are a **professional debate evaluator**.
Analyze the provided arguments and return a structured evaluation.

### Scoring Rubric:
- Sentiment (0–100)
- Clarity (0–100)
- Vocabulary Richness (0–100)
- Average Word Length (0–100)
- Coherence (0–100)

### Rules:
1. Provide descriptive scores (0–100) for each metric.
2. Compute totals using weights:
   - Clarity (30%)
   - Sentiment (30%)
   - Vocabulary Richness (20%)
   - Avg Word Length (10%)
   - Coherence (10%)
3. Winner = participant with highest total.
4. Return strictly valid JSON.
Arguments: ${argsString}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    return analysisResult;

  } catch (error) {
    console.error('Gemini AI analysis error:', error);
    throw error;
  }
};

export default {
  analyzeDebateForBackend,
  analyzeUserArguments: analyzeUserArguments,
  calculateCoherence,
  calculateEvidence,
  calculateLogic,
  calculatePersuasiveness
};