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

// Enhanced Analysis Functions with better differentiation
const calculateCoherence = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Base score based on length (longer texts generally more coherent)
  let score = Math.min(40 + (wordCount * 0.5), 70);
  
  // Flow and transition words
  const flowWords = ['because', 'therefore', 'however', 'furthermore', 'additionally', 'consequently', 'moreover', 'meanwhile', 'nevertheless', 'thus', 'hence'];
  const flowCount = flowWords.filter(word => text.toLowerCase().includes(word)).length;
  score += flowCount * 8;
  
  // Sentence structure complexity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length > 1) score += 5;
  if (sentences.length > 3) score += 10;
  
  // Punctuation use (indicates structure)
  const punctuationCount = (text.match(/[,.;:!?]/g) || []).length;
  score += Math.min(punctuationCount * 2, 15);
  
  // Repetition penalty
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  const repetitionRatio = uniqueWords.size / Math.max(wordCount, 1);
  score *= (0.5 + repetitionRatio * 0.5);
  
  return Math.min(100, Math.max(20, Math.round(score)));
};

const calculateEvidence = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Base score (longer arguments might have more evidence)
  let score = Math.min(30 + (wordCount * 0.3), 50);
  
  // Evidence keywords with different weights
  const strongEvidence = ['study', 'research', 'survey', 'experiment', 'data', 'statistics', 'report', 'analysis'];
  const moderateEvidence = ['evidence', 'proof', 'example', 'case', 'instance', 'fact', 'source'];
  const weakEvidence = ['think', 'believe', 'opinion', 'feel'];
  
  const strongCount = strongEvidence.filter(word => text.toLowerCase().includes(word)).length;
  const moderateCount = moderateEvidence.filter(word => text.toLowerCase().includes(word)).length;
  const weakCount = weakEvidence.filter(word => text.toLowerCase().includes(word)).length;
  
  score += strongCount * 15;
  score += moderateCount * 8;
  score -= weakCount * 5; // Opinion words reduce evidence score
  
  // Numbers and percentages indicate data
  const numberMatches = text.match(/\d+(\.\d+)?%?/g) || [];
  score += numberMatches.length * 10;
  
  // Citations or references
  if (/according to|studies show|research indicates|scientists say|experts/i.test(text)) {
    score += 20;
  }
  
  // Specific examples
  if (/for example|such as|including|like/i.test(text)) {
    score += 10;
  }
  
  return Math.min(100, Math.max(10, Math.round(score)));
};

const calculateLogic = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Base score
  let score = Math.min(35 + (wordCount * 0.4), 55);
  
  // Logical connectors and structure
  const logicalWords = ['if', 'then', 'because', 'since', 'given that', 'assuming', 'therefore', 'thus', 'consequently'];
  const logicalCount = logicalWords.filter(word => text.toLowerCase().includes(word)).length;
  score += logicalCount * 10;
  
  // Counter-arguments and balance
  const balanceWords = ['however', 'although', 'despite', 'while', 'but', 'nevertheless', 'on the other hand'];
  const balanceCount = balanceWords.filter(word => text.toLowerCase().includes(word)).length;
  score += balanceCount * 12;
  
  // Cause and effect language
  if (/cause|effect|result|lead to|due to/i.test(text)) {
    score += 15;
  }
  
  // Conditional statements
  const conditionalPattern = /if.+then|when.+will|should.+would/i;
  if (conditionalPattern.test(text)) {
    score += 10;
  }
  
  // Avoid overly emotional language (reduces logical score)
  const emotionalWords = ['hate', 'love', 'amazing', 'terrible', 'awful', 'fantastic'];
  const emotionalCount = emotionalWords.filter(word => text.toLowerCase().includes(word)).length;
  score -= emotionalCount * 8;
  
  return Math.min(100, Math.max(15, Math.round(score)));
};

const calculatePersuasiveness = (text, topic) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Base score
  let score = Math.min(40 + (wordCount * 0.3), 60);
  
  // Persuasive language
  const persuasiveWords = ['should', 'must', 'need to', 'important', 'crucial', 'essential', 'urgent', 'vital', 'necessary'];
  const persuasiveCount = persuasiveWords.filter(word => text.toLowerCase().includes(word)).length;
  score += persuasiveCount * 8;
  
  // Impact words
  const impactWords = ['significant', 'major', 'critical', 'vital', 'devastating', 'beneficial', 'harmful', 'positive', 'negative'];
  const impactCount = impactWords.filter(word => text.toLowerCase().includes(word)).length;
  score += impactCount * 6;
  
  // Action-oriented language
  if (/we should|we must|we need|let's|action|solution|address/i.test(text)) {
    score += 15;
  }
  
  // Appeals to values or emotions
  if (/future|children|society|economy|environment|safety|security/i.test(text)) {
    score += 10;
  }
  
  // Topic relevance
  if (topic) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const relevanceCount = topicWords.filter(word => text.toLowerCase().includes(word)).length;
    score += relevanceCount * 5;
  }
  
  // Questions that engage the audience
  const questionCount = (text.match(/\?/g) || []).length;
  score += Math.min(questionCount * 5, 15);
  
  return Math.min(100, Math.max(20, Math.round(score)));
};

const rateScore = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Poor";
};

const generateStrengths = (coherence, evidence, logic, persuasiveness) => {
  const strengths = [];
  if (coherence >= 75) strengths.push("Exceptionally clear and well-structured arguments");
  else if (coherence >= 65) strengths.push("Clear and coherent presentation of ideas");
  
  if (evidence >= 75) strengths.push("Strong supporting evidence and factual backing");
  else if (evidence >= 65) strengths.push("Good use of supporting information");
  
  if (logic >= 75) strengths.push("Excellent logical reasoning and sound conclusions");
  else if (logic >= 65) strengths.push("Solid logical flow and reasoning");
  
  if (persuasiveness >= 75) strengths.push("Highly compelling and persuasive arguments");
  else if (persuasiveness >= 65) strengths.push("Effective persuasive techniques");
  
  // Add some variety based on combinations
  if (evidence >= 70 && logic >= 70) strengths.push("Strong analytical thinking");
  if (coherence >= 70 && persuasiveness >= 70) strengths.push("Effective communication style");
  
  if (strengths.length === 0) {
    strengths.push("Shows active participation in the debate");
  }
  
  return strengths;
};

const generateWeaknesses = (coherence, evidence, logic, persuasiveness) => {
  const weaknesses = [];
  
  if (coherence < 50) weaknesses.push("Arguments lack clear structure and organization");
  else if (coherence < 65) weaknesses.push("Could improve logical flow between points");
  
  if (evidence < 50) weaknesses.push("Needs more factual evidence and supporting data");
  else if (evidence < 65) weaknesses.push("Would benefit from stronger supporting evidence");
  
  if (logic < 50) weaknesses.push("Logical reasoning needs significant improvement");
  else if (logic < 65) weaknesses.push("Could strengthen logical connections");
  
  if (persuasiveness < 50) weaknesses.push("Arguments lack convincing power and impact");
  else if (persuasiveness < 65) weaknesses.push("Could be more persuasive and engaging");
  
  // Specific advice based on low scores
  if (evidence < 60 && logic < 60) {
    weaknesses.push("Focus on building stronger fact-based arguments");
  }
  
  return weaknesses;
};

const generateFeedback = (score) => {
  if (score >= 85) return "Outstanding performance with excellent argumentation across all criteria. Shows mastery of debate skills.";
  if (score >= 75) return "Strong debate performance with well-developed arguments and good analytical thinking.";
  if (score >= 65) return "Good argumentation with solid points, though some areas could be strengthened.";
  if (score >= 55) return "Decent arguments showing understanding of the topic, but significant room for improvement in structure and evidence.";
  if (score >= 45) return "Basic arguments presented, but needs improvement in logic, evidence, and persuasiveness.";
  return "Arguments need substantial development in structure, evidence, and logical reasoning to be more effective.";
};

const analyzeUserArguments = (userArgs, topic) => {
  const argTexts = userArgs.map(arg => arg.argumentText || arg.content || '').join(' ');
  
  // Calculate individual scores
  const coherenceScore = calculateCoherence(argTexts);
  const evidenceScore = calculateEvidence(argTexts);
  const logicScore = calculateLogic(argTexts);
  const persuasivenessScore = calculatePersuasiveness(argTexts, topic);
  
  // More sophisticated weighting for total score
  const weights = {
    coherence: 0.25,      // 25% - How well structured
    evidence: 0.30,       // 30% - Supporting data/facts
    logic: 0.25,          // 25% - Logical reasoning
    persuasiveness: 0.20  // 20% - Convincing power
  };
  
  const total = Math.round(
    coherenceScore * weights.coherence +
    evidenceScore * weights.evidence +
    logicScore * weights.logic +
    persuasivenessScore * weights.persuasiveness
  );
  
  // Calculate argument statistics
  const totalLength = argTexts.length;
  const avgLength = userArgs.length > 0 ? Math.round(totalLength / userArgs.length) : 0;
  
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
    averageLength: avgLength,
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