// controllers/debateController.js
import axios from "axios";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import geminiService from "../services/geminiService.js";
import mlAnalysisService from "../services/mlAnalysisService.js";
import dotenv from "dotenv";
dotenv.config();

// Health check endpoint
export const healthCheck = async (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Debate service is running' });
};

// Create a private debate
export const createPrivateDebate = async (req, res) => {
  const { topic, description } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic required" });
  
  try {
    let finalDescription = description;
    
    // Generate description using Gemini AI if not provided
    if (!description && geminiService.isAvailable()) {
      try {
        console.log('🤖 Generating description using Gemini AI for private debate topic:', topic);
        finalDescription = await geminiService.generateDebateDescription(topic);
        console.log('✅ Generated description for private debate:', finalDescription);
      } catch (err) {
        console.warn('⚠️ Failed to generate description with Gemini:', err.message);
        finalDescription = `Join the private debate about ${topic} and share your perspective on this important topic.`;
      }
    } else if (!description) {
      finalDescription = `Join the private debate about ${topic} and share your perspective on this important topic.`;
    }

    const inviteCode = Math.random().toString(36).substring(2, 8);
    const debateData = { 
      topic, 
      description: finalDescription,
      isPrivate: true, 
      inviteCode, 
      joinedUsers: [req.user.id] 
    };
    const debate = await Debate.create(debateData);
    res.status(201).json({ id: debate._id, inviteCode });
  } catch (err) {
    console.error("[create private debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
};

// Join private debate
export const joinPrivateDebate = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const debate = await Debate.findOne({ inviteCode });
    if (!debate) return res.status(404).json({ error: "Invalid invite code" });

    if (debate.joinedUsers.includes(req.user.id)) {
      return res.status(400).json({ error: "You already joined this debate" });
    }

    if (debate.joinedUsers.length >= 2) {
      return res.status(400).json({ error: "Debate is full" });
    }

    debate.joinedUsers.push(req.user.id);
    await debate.save();
    res.json({ id: debate._id, message: "Successfully joined debate" });
  } catch (err) {
    console.error("[join private debate]", err.message);
    res.status(500).json({ message: "Failed to join debate" });
  }
};

// Create public debate
export const createDebate = async (req, res) => {
  try {
    const { topic, description, isPrivate = false } = req.body;
    let finalDescription = description;
    
    // Generate description using Gemini AI if not provided
    if (!description && geminiService.isAvailable()) {
      try {
        console.log('🤖 Generating description using Gemini AI for topic:', topic);
        finalDescription = await geminiService.generateDebateDescription(topic);
        console.log('✅ Generated description:', finalDescription);
      } catch (err) {
        console.warn('⚠️ Failed to generate description with Gemini:', err.message);
        finalDescription = `Join the debate about ${topic} and share your perspective on this important topic.`;
      }
    } else if (!description) {
      finalDescription = `Join the debate about ${topic} and share your perspective on this important topic.`;
    }

    const debateData = { 
      topic, 
      description: finalDescription,
      isPrivate, 
      joinedUsers: [req.user.id] 
    };
    
    const debate = await Debate.create(debateData);
    res.status(201).json(debate);
  } catch (err) {
    console.error("[create debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
};

// Join debate
export const joinDebate = async (req, res) => {
  const debateId = req.params.id;
  try {
    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ error: "Debate not found" });

    if (debate.joinedUsers.includes(req.user.id)) {
      return res.status(400).json({ error: "Already joined" });
    }

    if (debate.joinedUsers.length >= (debate.maxUsers || 2)) {
      return res.status(400).json({ error: "Debate is full" });
    }

    debate.joinedUsers.push(req.user.id);
    if (debate.joinedUsers.length === (debate.maxUsers || 2)) {
      debate.status = "active";
      debate.startedAt = new Date();
    }
    await debate.save();

    res.json(debate);
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

    const participantUsernames = debate.joinedUsers.map(user => user.username);

    res.json({
      id: debate._id,
      topic: debate.topic,
      status: debate.status,
      isFinalized: debate.status === 'completed',
      participants: participantUsernames,
      totalArguments: debate.arguments?.length || 0,
      result: debate.result,
      createdAt: debate.createdAt,
      maxUsers: debate.maxUsers || 2
    });
  } catch (err) {
    console.error("[get debate status]", err.message);
    res.status(500).json({ message: "Failed to fetch debate status" });
  }
};

// Get open debates
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

    // Generate AI-based score for the argument
    let score;
    try {
      // Use enhanced AI scoring
      const coherenceScore = calculateCoherence(content);
      const evidenceScore = calculateEvidence(content);
      const logicScore = calculateLogic(content);
      const persuasivenessScore = calculatePersuasiveness(content, debate.topic);
      
      score = {
        sentiment: { score: persuasivenessScore, rating: getScoreRating(persuasivenessScore) },
        clarity: { score: coherenceScore, rating: getScoreRating(coherenceScore) },
        vocab_richness: { score: evidenceScore, rating: getScoreRating(evidenceScore) },
        avg_word_len: { score: logicScore, rating: getScoreRating(logicScore) },
        length: content.split(' ').length,
        total: Math.round((coherenceScore + evidenceScore + logicScore + persuasivenessScore) / 4)
      };
    } catch (scoreErr) {
      console.warn("[AI scoring failed] using deterministic fallback:", scoreErr.message);
      // Provide structured deterministic fallback score based on content analysis
      const wordCount = content.split(' ').length;
      const charCount = content.length;
      const avgWordLength = charCount / wordCount;
      
      // Deterministic scoring based on content metrics
      const baseScore = Math.min(100, Math.max(20, 
        40 + (wordCount * 2) + (avgWordLength * 5) + (charCount / 10)
      ));
      
      score = {
        sentiment: { score: Math.round(baseScore + (wordCount > 20 ? 10 : 0)), rating: getScoreRating(baseScore + (wordCount > 20 ? 10 : 0)) },
        clarity: { score: Math.round(baseScore + (avgWordLength > 4 ? 15 : 0)), rating: getScoreRating(baseScore + (avgWordLength > 4 ? 15 : 0)) },
        vocab_richness: { score: Math.round(baseScore + (charCount > 100 ? 20 : 0)), rating: getScoreRating(baseScore + (charCount > 100 ? 20 : 0)) },
        avg_word_len: { score: Math.round(baseScore + (wordCount > 15 ? 5 : 0)), rating: getScoreRating(baseScore + (wordCount > 15 ? 5 : 0)) },
        length: wordCount,
        total: Math.round(baseScore)
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

    const argumentData = {
      id: addedArgument._id,
      content: addedArgument.content,
      score: addedArgument.score,
      username: addedArgument.user?.username || "Unknown",
      color: addedArgument.user?.color || "#333",
      createdAt: addedArgument.createdAt,
    };

    // Broadcast new argument to all users in the debate room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`debate-${req.params.id}`).emit('argument-added', argumentData);
      console.log(`📢 Broadcasting new argument from ${argumentData.username} to debate-${req.params.id}`);
    }

    res.status(201).json(argumentData);
  } catch (err) {
    console.error("[add argument]", err.message);
    res.status(500).json({ message: "Failed to add argument" });
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
export const finalizeDebate = async (req, res) => {
  try {
    const debateId = req.params.id;
    const debate = await Debate.findById(debateId)
      .populate("arguments.user", "username")
      .populate("joinedUsers", "username");

    if (!debate) return res.status(404).json({ error: "Debate not found" });
    if (!debate.arguments || debate.arguments.length === 0)
      return res.status(400).json({ error: "No arguments to finalize" });

    // Check if debate is already finalized
    if (debate.status === "completed") {
      return res.status(400).json({ error: "Debate is already finalized" });
    }

    // Check if user is participant
    if (!debate.joinedUsers.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    // Prepare arguments for AI analysis
    if (debate.joinedUsers.length < 2) {
      return res.status(400).json({ error: "Debate requires at least two users to finalize." });
    }

    // Check if this is a force finalization (both users approved) or single user request
    const { forceFinalize, approvedBy } = req.body;
    
    if (!forceFinalize && debate.joinedUsers.length > 1) {
      // Multiple participants - require mutual approval via Socket.IO
      return res.status(400).json({ 
        error: "Multiple participants detected. Both users must approve finalization.",
        requiresApproval: true 
      });
    }

    console.log(`🏆 Finalizing debate ${debateId} with force: ${forceFinalize}`);

    // Prepare arguments for AI analysis with proper user data
    const argumentsForAnalysis = debate.arguments.map(arg => ({
      username: arg.user?.username || "Anonymous",
      content: arg.content || "",
      timestamp: arg.createdAt || new Date(),
      userId: arg.user?._id || null
    }));

    const usernames = [...new Set(argumentsForAnalysis.map(arg => arg.username))];
    
    console.log('🤖 Starting AI analysis for participants:', usernames);
    console.log('🔍 Arguments for analysis:', argumentsForAnalysis.length);

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
    debate.finalizedAt = new Date();
    await debate.save();

    // Store results in participants' profiles
    try {
      await storeResultsInProfiles(debate._id, debate.joinedUsers, analysisResult);
      console.log('✅ Results stored in user profiles');
    } catch (profileErr) {
      console.warn('⚠️ Failed to store results in profiles:', profileErr.message);
    }

    // Broadcast results via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`debate-${debateId}`).emit('debate-finalized', {
        debateId: debateId,
        results: analysisResult,
        analysisSource,
        winner: analysisResult.winner,
        finalizedAt: debate.finalizedAt
      });
      console.log(`📢 Broadcasting finalization to debate-${debateId}`);
    }

    console.log('🎉 Debate finalized successfully using AI analysis');
    res.json({
      message: "Debate finalized successfully",
      results: analysisResult,
      analysisSource,
      winner: analysisResult.winner,
      finalizedAt: debate.finalizedAt
    });

  } catch (error) {
    console.error('❌ Debate finalization failed:', error);
    res.status(500).json({ 
      error: "Failed to finalize debate", 
      details: error.message 
    });
  }
};

// Request finalization (for mutual approval)
export const requestFinalization = async (req, res) => {
  try {
    console.log('🔍 Request finalization debug:', {
      userId: req.user?.id,
      username: req.user?.username,
      hasUser: !!req.user
    });

    const debateId = req.params.id;
    const debate = await Debate.findById(debateId).populate("joinedUsers", "username");

    if (!debate) return res.status(404).json({ error: "Debate not found" });
    
    // Check if user is participant
    if (!debate.joinedUsers.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    if (debate.status === "completed") {
      return res.status(400).json({ error: "Debate is already finalized" });
    }

    // Initialize finalization requests if not exists
    if (!debate.finalizationRequests) {
      debate.finalizationRequests = [];
    }

    console.log('🔍 Existing finalization requests:', debate.finalizationRequests.length);

    // Check if user already requested
    const existingRequest = debate.finalizationRequests.find(
      request => request.userId.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({ error: "You have already requested finalization" });
    }

    // Add finalization request
    debate.finalizationRequests.push({
      userId: req.user.id,
      username: req.user.username,
      requestedAt: new Date()
    });

    await debate.save();

    // Broadcast finalization request via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`debate-${debateId}`).emit('finalization-requested', {
        requestedBy: req.user.username,
        userId: req.user.id,
        timestamp: new Date().toISOString(),
        totalRequests: debate.finalizationRequests.length,
        requiredApprovals: debate.joinedUsers.length
      });
    }

    // Check if all participants have requested finalization
    if (debate.finalizationRequests.length >= debate.joinedUsers.length) {
      // All users approved - trigger automatic finalization
      console.log(`🎯 All users approved finalization for debate ${debateId}`);
      
      // Call finalization with force flag
      req.body.forceFinalize = true;
      req.body.approvedBy = debate.finalizationRequests.map(r => r.username);
      return finalizeDebate(req, res);
    }

    res.json({
      message: "Finalization requested successfully",
      pendingApprovals: debate.joinedUsers.length - debate.finalizationRequests.length,
      requestedBy: debate.finalizationRequests.map(r => r.username)
    });

  } catch (error) {
    console.error('❌ Request finalization failed:', error);
    res.status(500).json({ 
      error: "Failed to request finalization", 
      details: error.message 
    });
  }
};

// Store results in user profiles
async function storeResultsInProfiles(debateId, participants, analysisResult) {
  try {
    for (const participant of participants) {
      const userId = participant._id || participant;
      const username = participant.username;
      
      // Find opponent
      const opponent = participants.find(p => 
        (p._id || p).toString() !== userId.toString()
      );
      
      // Determine result for this user
      const userScore = analysisResult.results[username]?.total || 0;
      const isWinner = analysisResult.winner === username;
      let result = 'lost';
      
      if (isWinner) {
        result = 'won';
      } else {
        // Check for draws (very close scores)
        const scores = Object.values(analysisResult.results).map(r => r.total);
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        if (maxScore - minScore <= 5) {
          result = 'draw';
        }
      }

      // Update user document
      await User.findByIdAndUpdate(userId, {
        $push: {
          recentDebates: {
            $each: [{
              debateId: debateId,
              topic: analysisResult.topic || 'Unknown Topic',
              result: result,
              score: userScore,
              participatedAt: new Date(),
              opponent: opponent?.username || 'Unknown',
              analysisSource: analysisResult.analysisSource || 'ai'
            }],
            $slice: -10 // Keep only last 10 debates
          }
        },
        $inc: {
          'stats.totalDebates': 1,
          [`stats.${result === 'won' ? 'wins' : result === 'lost' ? 'losses' : 'draws'}`]: 1
        }
      });

      // Update average score
      const user = await User.findById(userId);
      if (user && user.stats.totalDebates > 0) {
        const totalScore = user.recentDebates.reduce((sum, debate) => sum + debate.score, 0);
        const averageScore = totalScore / user.recentDebates.length;
        
        await User.findByIdAndUpdate(userId, {
          'stats.averageScore': Math.round(averageScore * 100) / 100
        });
      }
    }
  } catch (error) {
    console.error('Error storing results in profiles:', error);
    throw error;
  }
}

// AI Analysis function with ML-first approach
async function performAIAnalysis(argumentsArray, topic) {
  console.log('🤖 Performing ML-first debate analysis for topic:', topic);
  
  try {
    // Use the new ML-first analysis service
    console.log('🔬 Using ML-first analysis service...');
    const analysisResult = await mlAnalysisService.analyzeDebate(argumentsArray, topic);
    console.log('✅ ML-first analysis completed successfully');
    return analysisResult;
  } catch (error) {
    console.error('❌ ML-first analysis failed, falling back to Gemini:', error);
    
    // Fallback to Gemini AI service
    if (geminiService.isAvailable()) {
      try {
        console.log('🤖 Falling back to Gemini AI analysis...');
        const analysisResult = await geminiService.analyzeDebate(argumentsArray, topic);
        console.log('✅ Gemini AI fallback completed successfully');
        return analysisResult;
      } catch (geminiError) {
        console.error('❌ Gemini AI fallback failed:', geminiError);
        console.log('🔄 Using enhanced local analysis as final fallback...');
        return performEnhancedAnalysis(argumentsArray, topic);
      }
    } else {
      console.warn('⚠️ Gemini AI service not available, using enhanced local analysis');
      return performEnhancedAnalysis(argumentsArray, topic);
    }
  }
}

// Enhanced local analysis as fallback
function performEnhancedAnalysis(argumentsArray, topic) {
  console.log('🔄 Performing enhanced local analysis for topic:', topic);
  
  // Group arguments by username
  const usernames = [...new Set(argumentsArray.map(arg => arg.username))];
  const results = {
    results: {},
    winner: null,
    analysisSource: 'enhanced_local',
    finalizedAt: new Date()
  };

  // Analyze each participant's arguments
  for (const username of usernames) {
    const userArgs = argumentsArray.filter(arg => arg.username === username);
    const analysisResult = analyzeUserArgumentsEnhanced(userArgs, topic);
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

// Analyze individual user arguments with enhanced local analysis
function analyzeUserArgumentsEnhanced(userArgs, topic) {
  const argTexts = userArgs.map(arg => arg.content).join(' ');
  
  // Enhanced local analysis
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
  
  // Check for counterarguments
  if (/however|although|despite|while/.test(text.toLowerCase())) score += 15;
  
  return Math.min(100, Math.max(25, score));
}

function calculatePersuasiveness(text, topic) {
  // Check for persuasive elements
  const persuasiveWords = ['should', 'must', 'important', 'crucial', 'essential', 'urgent'];
  const persuasiveCount = persuasiveWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (persuasiveCount * 7);
  
  // Check for emotional appeal
  if (/significant|critical|vital|devastating|beneficial/.test(text.toLowerCase())) score += 10;
  
  // Topic relevance bonus
  if (topic && text.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) score += 15;
  
  return Math.min(100, Math.max(30, score));
}

function generateStrengths(coherence, evidence, logic, persuasiveness) {
  const strengths = [];
  if (coherence >= 70) strengths.push("Clear and coherent arguments");
  if (evidence >= 70) strengths.push("Strong supporting evidence");
  if (logic >= 70) strengths.push("Sound logical reasoning");
  if (persuasiveness >= 70) strengths.push("Compelling and persuasive");
  
  if (strengths.length === 0) strengths.push("Shows engagement in the debate");
  
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

function getScoreRating(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  if (score >= 50) return "Below Average";
  return "Poor";
}

// Basic fallback analysis (enhanced)
function performBasicAnalysis(argumentsArray, topic) {
  console.log('🔄 Performing basic analysis fallback');
  
  const usernames = [...new Set(argumentsArray.map(arg => arg.username))];
  
  const results = {
    results: {},
    winner: null,
    analysisSource: 'fallback',
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
      averageLength: Math.round(totalLength / argCount) || 0,
      analysis: {
        strengths: ["Active participation", "Consistent engagement"],
        weaknesses: ["Could improve argument depth"],
        feedback: generateFeedback(total)
      }
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

// Save result to database
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
    console.log(`🔍 [getResults] Fetching results for debate ID: ${debateId}`);
    
    // First, try to get results from Result collection
    let results = await Result.findOne({ debateId: debateId.toString() });
    console.log(`📊 [getResults] Results from Result collection:`, results ? 'Found' : 'Not found');
    
    // If not found in Result collection, check if debate has results
    if (!results) {
      const debate = await Debate.findById(debateId);
      console.log(`📋 [getResults] Debate document:`, debate ? 'Found' : 'Not found');
      if (debate?.result) {
        console.log(`✅ [getResults] Debate has result, structure:`, Object.keys(debate.result));
        // Use debate.result and save it to Result collection for future queries
        results = {
          debateId: debateId.toString(),
          winner: debate.result.winner,
          results: debate.result.results,
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
          console.log(`💾 [getResults] Saved results to Result collection`);
        } catch (saveErr) {
          console.warn("Could not save results to Result collection:", saveErr.message);
        }
      }
    }
    
    if (!results) {
      console.log(`❌ [getResults] No results found for debate ${debateId}`);
      return res.status(404).json({ error: "Results not found. Debate may not be finalized yet." });
    }
    
    console.log(`📤 [getResults] Returning results structure:`, Object.keys(results));
    console.log(`📤 [getResults] Results.results exists:`, !!results.results);
    res.json(results);
  } catch (err) {
    console.error('[get results]', err.message);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};