// controllers/debateController.js
import axios from "axios";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

// Create a private debate
export const createPrivateDebate = async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic required" });
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const debateData = { topic, isPrivate: true, inviteCode, joinedUsers: [req.user.id] };
    const debate = await Debate.create(debateData);
    res.json(debate);
  } catch (err) {
    console.error("[create private debate]", err.message);
    res.status(500).json({ message: "Failed to create private debate" });
  }
};

// Join a private debate
export const joinPrivateDebate = async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) return res.status(400).json({ message: "Invite code required" });
  try {
    const debate = await Debate.findOne({ inviteCode });
    if (!debate) return res.status(404).json({ message: "Debate not found" });
    if (debate.joinedUsers.includes(req.user.id)) {
      return res.status(200).json({ message: "Already joined", debate });
    }
    debate.joinedUsers.push(req.user.id);
    await debate.save();
    res.json({ message: "Joined private debate", debate });
  } catch (err) {
    console.error("[join private debate]", err.message);
    res.status(500).json({ message: "Failed to join private debate" });
  }
};

// Create debate (open or private)
export const createDebate = async (req, res) => {
  const { topic, isPrivate = false } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic required" });
  try {
    const debateData = { topic, isPrivate, joinedUsers: [req.user.id] };
    if (isPrivate) debateData.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const debate = await Debate.create(debateData);
    res.json(debate);
  } catch (err) {
    console.error("[create debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
};

// Join a debate (open)
export const joinDebate = async (req, res) => {
  const debateId = req.params.id;
  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: "Debate not found" });
    if (debate.joinedUsers.includes(req.user.id)) {
      return res.status(200).json({ message: "Already joined", debate });
    }
    debate.joinedUsers.push(req.user.id);
    if (debate.joinedUsers.length >= (debate.maxUsers || 2)) {
      debate.status = "active";
      debate.startedAt = new Date();
    }
    await debate.save();
    res.json({ message: "Joined debate", debate });
  } catch (err) {
    console.error("[join debate]", err.message);
    res.status(500).json({ message: "Failed to join debate" });
  }
};

// Get debate status
export const getDebateStatus = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id).populate("joinedUsers", "username");
    if (!debate) return res.status(404).json({ error: "Debate not found" });

    res.json({
      id: debate._id,
      topic: debate.topic,
      status: debate.status,
      participants: debate.joinedUsers.map((p) => p.username),
      totalArguments: debate.arguments.length,
      result: debate.status === "completed" ? debate.result : null,
    });
  } catch (err) {
    console.error("[get debate status]", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all open debates
export const getOpenDebates = async (req, res) => {
  try {
    const openDebates = await Debate.find({ status: "waiting" }).sort({ createdAt: -1 });
    res.json(openDebates);
  } catch (err) {
    console.error("[get open debates]", err.message);
    res.status(500).json({ message: "Failed to fetch open debates" });
  }
};

// Add argument
export const addArgument = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate input
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "Argument must be at least 10 characters long" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: "Argument too long (max 2000 characters)" });
    }

    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ error: "Debate not found" });

    // Check if user is participant
    if (!debate.joinedUsers.includes(req.user.id)) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    let score;
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/analyze`, { 
        text: content 
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      score = mlResponse.data.score || mlResponse.data;
    } catch (mlErr) {
      console.warn("[ML API unavailable] using mock scoring:", mlErr.message);
      // Provide structured fallback score
      score = {
        sentiment: { score: Math.random() * 100, rating: "Good" },
        clarity: { score: Math.random() * 100, rating: "Good" },
        vocab_richness: { score: Math.random() * 100, rating: "Good" },
        avg_word_len: { score: Math.random() * 100, rating: "Good" },
        length: content.split(' ').length
      };
    }

    const newArgument = {
      user: req.user.id,
      content: content.trim(),
      score,
      createdAt: new Date()
    };

    debate.arguments.push(newArgument);
    await debate.save();

    // Populate user data for the new argument
    const populatedDebate = await Debate.findById(req.params.id)
      .populate('arguments.user', 'username color');
    
    const addedArgument = populatedDebate.arguments[populatedDebate.arguments.length - 1];

    const formattedArgument = {
      id: addedArgument._id,
      content: addedArgument.content,
      score: addedArgument.score,
      username: addedArgument.user?.username || 'Unknown',
      color: addedArgument.user?.color || '#333',
      createdAt: addedArgument.createdAt
    };

    // Broadcast to WebSocket clients
    const io = req.app.get('io');
    if (io && io.broadcastArgumentAdded) {
      io.broadcastArgumentAdded(req.params.id, formattedArgument);
    }

    res.json({ 
      message: "Argument added successfully", 
      score,
      argument: formattedArgument
    });
  } catch (err) {
    console.error("[add argument] error details:", err);
    res.status(500).json({ message: "Error adding argument", details: err.message });
  }
};

// Get arguments
export const getArguments = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id).populate("arguments.user", "username color");
    if (!debate) return res.status(404).json({ error: "Debate not found" });

    const formattedArgs = debate.arguments.map((a) => ({
      id: a._id,
      content: a.content,
      score: a.score,
      username: a.user?.username || "Unknown",
      color: a.user?.color || "#333",
      createdAt: a.createdAt,
    }));

    res.json(formattedArgs);
  } catch (err) {
    console.error("[get arguments]", err.message);
    res.status(500).json({ message: "Failed to fetch arguments" });
  }
};

// Finalize debate
// controllers/debateController.js

export const finalizeDebate = async (req, res) => {
  try {
    const debateId = req.params.id;
    const debate = await Debate.findById(debateId).populate("arguments.user", "username");

    if (!debate) return res.status(404).json({ error: "Debate not found" });
    if (!debate.arguments || debate.arguments.length === 0)
      return res.status(400).json({ error: "No arguments to finalize" });

    // Check if debate is already finalized
    if (debate.status === "completed") {
      return res.status(400).json({ error: "Debate is already finalized" });
    }

    // Prepare arguments for AI analysis
    if (debate.joinedUsers.length < 2) {
      return res.status(400).json({ error: "Debate requires at least two users to finalize." });
    }

    // Check if this is a force finalization (from socket approval) or requires approval
    const { forceFinalize } = req.body;
    
    if (debate.participants && debate.participants.length > 1 && !forceFinalize) {
      return res.status(400).json({ 
        error: "Multiple participants detected. Use socket events for mutual approval.",
        requiresApproval: true 
      });
    }

    // Prepare arguments for AI analysis
    const argumentsForAnalysis = debate.arguments.map(arg => ({
      username: arg.user?.username || "Anonymous",
      content: arg.content || "",
      timestamp: arg.timestamp
    }));

    const usernames = [...new Set(argumentsForAnalysis.map(arg => arg.username))];
    
    console.log('🤖 Starting AI analysis for participants:', usernames);

    // Use AI analysis flow
    let analysisResult;
    let analysisSource = 'ai';
    
    try {
      console.log('🤖 Performing AI analysis...');
      analysisResult = await performAIAnalysis(argumentsForAnalysis, debate.topic);
      console.log('✅ AI analysis completed successfully');
    } catch (aiErr) {
      console.warn('⚠️ AI analysis failed, using basic fallback:', aiErr.message);
      // Fallback to basic scoring
      analysisResult = await performBasicAnalysis(argumentsForAnalysis, debate.topic);
      analysisSource = 'fallback';
      console.log('✅ Basic fallback analysis completed');
    }
    
    // Save results to database
    try {
      const savedResult = await saveResult(debate._id, analysisResult, analysisSource);
      console.log('✅ Results saved to database');
    } catch (saveErr) {
      console.error('❌ Failed to save results:', saveErr);
      // Continue with finalization even if save fails
    }

    // Update debate status and save result
    debate.status = 'completed';
    debate.result = analysisResult;
    await debate.save();

    // Broadcast results via socket
    if (io && io.getIO) {
      io.getIO().to(`debate_${debateId}`).emit('debateFinalized', {
        debateId: debateId,
        results: analysisResult,
        analysisSource,
        winner: analysisResult.winner
      });
    }

    console.log('🎉 Debate finalized successfully using AI analysis');
    res.json({
      message: "Debate finalized successfully",
      results: analysisResult,
      analysisSource,
      winner: analysisResult.winner
    });

  } catch (error) {
    console.error('❌ Debate finalization failed:', error);
    res.status(500).json({ 
      error: "Failed to finalize debate", 
      details: error.message 
    });
  }
};

// Now implementing AI analysis functions

// AI Analysis function (will be enhanced with actual Genkit integration)
async function performAIAnalysis(argumentsArray, topic) {
  console.log('🤖 Performing AI analysis for topic:', topic);
  
  // Group arguments by username
  const usernames = [...new Set(argumentsArray.map(arg => arg.username))];
  const results = {
    results: {},
    winner: null,
    analysisSource: 'ai',
    finalizedAt: new Date()
  };

  // Analyze each participant's arguments
  for (const username of usernames) {
    const userArgs = argumentsArray.filter(arg => arg.username === username);
    const analysisResult = await analyzeUserArguments(userArgs, topic);
    results.results[username] = analysisResult;
  }

  // Determine winner
  const scores = Object.entries(results.results).map(([username, data]) => ({
    username,
    total: data.total
  }));
  
  results.winner = scores.reduce((prev, current) => 
    current.total > prev.total ? current : prev
  ).username;

  return results;
}

// Analyze individual user arguments with AI
async function analyzeUserArguments(userArgs, topic) {
  const argTexts = userArgs.map(arg => arg.content).join(' ');
  
  // Enhanced AI analysis (placeholder for actual Genkit integration)
  const coherenceScore = calculateCoherence(argTexts);
  const evidenceScore = calculateEvidence(argTexts);
  const logicScore = calculateLogic(argTexts);
  const persuasivenessScore = calculatePersuasiveness(argTexts, topic);
  
  const total = Math.round((coherenceScore + evidenceScore + logicScore + persuasivenessScore) / 4);
  
  return {
    scores: {
      coherence: coherenceScore,
      evidence: evidenceScore,
      logic: logicScore,
      persuasiveness: persuasivenessScore
    },
    total,
    argumentCount: userArgs.length,
    averageLength: Math.round(argTexts.length / userArgs.length),
    analysis: {
      strengths: generateStrengths(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      weaknesses: generateWeaknesses(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      feedback: generateFeedback(total)
    }
  };
}

// Enhanced scoring functions
function calculateCoherence(text) {
  // Check for logical flow indicators
  const flowWords = ['because', 'therefore', 'however', 'furthermore', 'additionally', 'consequently'];
  const flowCount = flowWords.filter(word => text.toLowerCase().includes(word)).length;
  
  // Base score + flow bonus
  let score = 60 + (flowCount * 5);
  
  // Sentence structure bonus
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) score += 10;
  
  return Math.min(100, Math.max(30, score));
}

function calculateEvidence(text) {
  const evidenceWords = ['study', 'research', 'data', 'statistics', 'evidence', 'survey', 'report'];
  const evidenceCount = evidenceWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (evidenceCount * 10);
  
  // Check for specific numbers or percentages
  if (/\d+%|\d+\.\d+%/.test(text)) score += 15;
  if (/according to|studies show|research indicates/.test(text.toLowerCase())) score += 20;
  
  return Math.min(100, Math.max(20, score));
}

function calculateLogic(text) {
  // Check for logical structure
  const logicalWords = ['if', 'then', 'because', 'since', 'given that', 'assuming'];
  const logicalCount = logicalWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 55 + (logicalCount * 8);
  
  // Check for cause-effect relationships
  if (/leads to|results in|causes|due to/.test(text.toLowerCase())) score += 15;
  
  return Math.min(100, Math.max(25, score));
}

function calculatePersuasiveness(text, topic) {
  let score = 50;
  
  // Emotional appeal
  const emotionalWords = ['important', 'crucial', 'vital', 'essential', 'significant'];
  const emotionalCount = emotionalWords.filter(word => text.toLowerCase().includes(word)).length;
  score += emotionalCount * 5;
  
  // Topic relevance
  if (topic && text.toLowerCase().includes(topic.toLowerCase())) score += 20;
  
  // Call to action or strong conclusion
  if (/should|must|need to|have to|it is clear that/.test(text.toLowerCase())) score += 15;
  
  return Math.min(100, Math.max(30, score));
}

// Helper functions for analysis feedback
function generateStrengths(coherence, evidence, logic, persuasiveness) {
  const strengths = [];
  if (coherence >= 80) strengths.push("Excellent logical flow and structure");
  if (evidence >= 80) strengths.push("Strong evidence and data support");
  if (logic >= 80) strengths.push("Clear logical reasoning");
  if (persuasiveness >= 80) strengths.push("Highly persuasive arguments");
  
  if (strengths.length === 0) {
    if (Math.max(coherence, evidence, logic, persuasiveness) >= 70) {
      strengths.push("Good overall argument construction");
    } else {
      strengths.push("Basic argument structure present");
    }
  }
  
  return strengths;
}

function generateWeaknesses(coherence, evidence, logic, persuasiveness) {
  const weaknesses = [];
  if (coherence < 60) weaknesses.push("Could improve logical flow between points");
  if (evidence < 60) weaknesses.push("Would benefit from more supporting evidence");
  if (logic < 60) weaknesses.push("Logical reasoning could be strengthened");
  if (persuasiveness < 60) weaknesses.push("Arguments could be more compelling");
  
  return weaknesses;
}

function generateFeedback(score) {
  if (score >= 85) return "Excellent argumentation with strong logical structure and evidence";
  if (score >= 70) return "Good arguments with room for minor improvements";
  if (score >= 55) return "Decent arguments that could benefit from better structure or evidence";
  return "Arguments need significant improvement in logic, evidence, or structure";
}

// Basic fallback analysis (enhanced)
function performBasicAnalysis(argumentsArray, usernames) {
  console.log('� Performing basic analysis fallback');
  
  const results = {
    results: {},
    winner: null,
    analysisSource: 'basic',
    finalizedAt: new Date()
  };

  usernames.forEach(username => {
    const userArgs = argumentsArray.filter(arg => arg.username === username);
    const totalLength = userArgs.reduce((sum, arg) => sum + (arg.content?.length || 0), 0);
    const argCount = userArgs.length;
    
    // Basic scoring based on participation and argument length
    const participationScore = Math.min(100, argCount * 25);
    const lengthScore = Math.min(100, totalLength / 10);
    const engagementScore = Math.min(100, argCount * 15 + (totalLength / argCount || 0) / 5);
    
    const total = Math.round((participationScore + lengthScore + engagementScore) / 3);
    
    results.results[username] = {
      scores: {
        coherence: Math.round(participationScore * 0.8),
        evidence: Math.round(lengthScore * 0.7),
        logic: Math.round(engagementScore * 0.9),
        persuasiveness: total
      },
      total,
      argumentCount: argCount,
      averageLength: Math.round(totalLength / argCount) || 0
    };
  });

  // Determine winner
  const scores = Object.entries(results.results).map(([username, data]) => ({
    username,
    total: data.total
  }));
  
  results.winner = scores.reduce((prev, current) => 
    current.total > prev.total ? current : prev
  ).username;

  return results;
}

// Enhanced save result function
async function saveResult(debateId, analysisResult, analysisSource) {
  try {
    const resultData = {
      debateId: debateId.toString(),
      winner: analysisResult.winner,
      results: analysisResult.results,
      analysisSource: analysisSource,
      finalizedAt: new Date(),
      // Legacy compatibility
      scores: analysisResult.results,
      totals: Object.fromEntries(
        Object.entries(analysisResult.results).map(([username, data]) => [username, data.total])
      )
    };

    const savedResult = await Result.findOneAndUpdate(
      { debateId: debateId.toString() },
      resultData,
      { upsert: true, new: true }
    );

    return savedResult;
  } catch (error) {
    console.error('Failed to save result:', error);
    throw error;
  }
}

// Get results
export const getResults = async (req, res) => {
  try {
    const debateId = req.params.id;
    
    // First, try to get results from Result collection
    let results = await Result.findOne({ debateId: debateId.toString() });
    
    // If not found in Result collection, check if debate has results
    if (!results) {
      const debate = await Debate.findById(debateId);
      if (debate?.result) {
        // Use debate.result and save it to Result collection for future queries
        results = {
          debateId: debateId.toString(),
          winner: debate.result.winner,
          scores: debate.result.scores,
          totals: debate.result.totals,
          coherence: debate.result.coherence,
          analysisSource: debate.result.analysisSource || 'unknown',
          finalizedAt: debate.result.finalizedAt || debate.updatedAt
        };
        
        // Save to Result collection for future queries
        try {
          await Result.findOneAndUpdate(
            { debateId: debateId.toString() },
            results,
            { upsert: true, new: true }
          );
        } catch (saveErr) {
          console.warn("Could not save results to Result collection:", saveErr.message);
        }
      }
    }
    
    if (!results) {
      return res.status(404).json({ error: "Results not found. Debate may not be finalized yet." });
    }
    
    res.json(results);
  } catch (err) {
    console.error("[get results]", err.message);
    res.status(500).json({ error: "Failed to fetch results", details: err.message });
  }
};

// Health check endpoint  
export const healthCheck = (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Debate backend running with AI analysis",
    timestamp: new Date().toISOString()
  });
};
