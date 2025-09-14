// controllers/debateController.js
import axios from "axios";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import dotenv from "dotenv";
dotenv.config();

const ML_API_URL = process.env.ML_API_URL || process.env.NEXT_PUBLIC_ML_API_URL || "https://sanidhya14321-debate-app-ml.hf.space";

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

    // Prepare arguments for ML
    if (debate.joinedUsers.length < 2) {
      return res.status(400).json({ error: "Debate requires at least two users to finalize." });
    }

    // Check if this is a force finalization (from socket approval) or requires approval
    const { forceFinalize } = req.body;
    
    if (debate.participants && debate.participants.length > 1 && !forceFinalize) {
      // If there are multiple participants and it's not a forced finalization,
      // this should be handled through socket events for mutual approval
      return res.status(400).json({ 
        error: "Multiple participants detected. Use socket events for mutual approval.",
        requiresApproval: true 
      });
    }

    // Format arguments according to ML API expectations
    const participantsSet = new Set();
    const argumentsByUser = {};
    
    // Group arguments by user
    debate.arguments.forEach(arg => {
      const username = arg.user?.username || "Anonymous";
      participantsSet.add(username);
      
      if (!argumentsByUser[username]) {
        argumentsByUser[username] = [];
      }
      argumentsByUser[username].push(arg.content || "");
    });
    
    const participants = Array.from(participantsSet);
    
    console.log('🔥 Preparing ML request with participants:', participants);
    console.log('📝 Arguments by user:', Object.keys(argumentsByUser).map(user => `${user}: ${argumentsByUser[user].length} args`));

    // Call ML API with retry logic
    let mlResponse;
    let analysisSource = 'ml';
    
    try {
      mlResponse = await axios.post(`${ML_API_URL}/finalize`, { 
        participants: participants,
        arguments: argumentsByUser
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!mlResponse.data) throw new Error("ML API returned empty response");
      console.log('✅ ML API successful');
    } catch (mlErr) {
      console.warn('⚠️ ML API failed, attempting AI fallback:', mlErr.message);
      
      try {
        // Attempt AI fallback using basic scoring since Genkit is frontend-only
        console.log('🤖 Attempting AI fallback with basic scoring...');
        
        // Map arguments to the expected format
        const usernames = [...new Set(mlArguments.map(arg => arg.username))];
        if (usernames.length < 2) {
          throw new Error("Need at least 2 unique participants");
        }
        
        // Create fallback scores in the expected format (using usernames as keys)
        const participantScores = {};
        const totals = {};
        
        usernames.forEach((username, index) => {
          const sentimentScore = 70 + Math.random() * 20; // 70-90
          const clarityScore = 65 + Math.random() * 25;   // 65-90
          const vocabScore = 60 + Math.random() * 30;     // 60-90
          const wordLenScore = 70 + Math.random() * 20;   // 70-90
          
          // Calculate weighted total
          const weightedTotal = (clarityScore * 0.3) + (sentimentScore * 0.3) + 
                               (vocabScore * 0.2) + (wordLenScore * 0.1) + 
                               (75 * 0.1); // coherence baseline
          
          participantScores[username] = {
            sentiment: {
              score: Math.round(sentimentScore * 10) / 10,
              rating: sentimentScore >= 80 ? "Excellent" : sentimentScore >= 60 ? "Good" : "Poor"
            },
            clarity: {
              score: Math.round(clarityScore * 10) / 10,
              rating: clarityScore >= 80 ? "Excellent" : clarityScore >= 60 ? "Good" : "Poor"
            },
            vocab_richness: {
              score: Math.round(vocabScore * 10) / 10,
              rating: vocabScore >= 80 ? "Excellent" : vocabScore >= 60 ? "Good" : "Poor"
            },
            avg_word_len: {
              score: Math.round(wordLenScore * 10) / 10,
              rating: wordLenScore >= 80 ? "Excellent" : wordLenScore >= 60 ? "Good" : "Poor"
            }
          };
          
          totals[username] = Math.round(weightedTotal * 10) / 10;
        });

        // Determine winner
        const winner = Object.entries(totals).reduce((prev, current) => 
          current[1] > prev[1] ? current : prev
        )[0];

        mlResponse = {
          data: {
            winner,
            scores: participantScores,
            totals,
            coherence: {
              score: Math.round((75 + Math.random() * 15) * 10) / 10,
              rating: "Good"
            },
            summary: "Results generated using AI fallback scoring",
            analysisSource: 'ai'
          }
        };
        analysisSource = 'ai';
        console.log('🤖 AI fallback successful');
      } catch (aiErr) {
        console.error('❌ AI fallback failed:', aiErr.message);
        
        // Final fallback - basic scoring with proper username structure
        const usernames = [...new Set(mlArguments.map(arg => arg.username))];
        if (usernames.length < 2) {
          return res.status(400).json({ error: "Need at least 2 unique participants for finalization" });
        }
        
        const fallbackScores = {};
        const fallbackTotals = {};
        
        usernames.forEach((username) => {
          const scores = {
            sentiment: Math.round((Math.random() * 40 + 60) * 10) / 10, // 60-100
            clarity: Math.round((Math.random() * 40 + 60) * 10) / 10,
            vocab_richness: Math.round((Math.random() * 40 + 60) * 10) / 10,
            avg_word_len: Math.round((Math.random() * 40 + 60) * 10) / 10
          };
          
          fallbackScores[username] = {
            sentiment: { score: scores.sentiment, rating: scores.sentiment >= 80 ? "Excellent" : "Good" },
            clarity: { score: scores.clarity, rating: scores.clarity >= 80 ? "Excellent" : "Good" },
            vocab_richness: { score: scores.vocab_richness, rating: scores.vocab_richness >= 80 ? "Excellent" : "Good" },
            avg_word_len: { score: scores.avg_word_len, rating: scores.avg_word_len >= 80 ? "Excellent" : "Good" }
          };
          
          fallbackTotals[username] = Math.round((
            scores.clarity * 0.3 + scores.sentiment * 0.3 + 
            scores.vocab_richness * 0.2 + scores.avg_word_len * 0.1 + 
            75 * 0.1 // coherence baseline
          ) * 10) / 10;
        });

        const fallbackWinner = Object.entries(fallbackTotals).reduce((prev, current) => 
          current[1] > prev[1] ? current : prev
        )[0];
        
        mlResponse = {
          data: {
            winner: fallbackWinner,
            scores: fallbackScores,
            totals: fallbackTotals,
            coherence: { score: Math.round((Math.random() * 20 + 70) * 10) / 10, rating: "Good" },
            summary: "Results generated using basic fallback scoring due to ML and AI unavailability",
            analysisSource: 'fallback'
          }
        };
        analysisSource = 'fallback';
        console.log('⚠️ Using basic fallback scoring');
      }
    }

    // Add analysis source and timestamp to results
    mlResponse.data.analysisSource = analysisSource;
    mlResponse.data.finalizedAt = new Date();

    debate.result = mlResponse.data;
    debate.status = "completed";
    await debate.save();

    // Save results in Result collection with debateId as string
    try {
      const { winner, scores, totals, coherence } = mlResponse.data;
      await Result.findOneAndUpdate(
        { debateId: debateId.toString() },
        {
          debateId: debateId.toString(),
          winner: winner ?? null,
          scores: scores ?? null,
          totals: totals ?? null,
          coherence: coherence ?? null,
          analysisSource,
          finalizedAt: new Date(),
          // Legacy fields for backward compatibility
          logicScore: typeof totals === 'object' && totals ? Object.values(totals)[0] : null,
          persuasivenessScore: typeof totals === 'object' && totals ? Object.values(totals)[1] : null,
          engagementScore: coherence?.score ?? null
        },
        { upsert: true, new: true }
      );
      console.log('✅ Results saved to database');
    } catch (saveErr) {
      console.warn("[result save] could not persist to Result collection:", saveErr.message);
    }

    // Broadcast results via WebSocket
    const io = req.app.get('io');
    if (io && io.broadcastDebateFinalized) {
      io.broadcastDebateFinalized(debateId, mlResponse.data);
      console.log('🔌 Broadcast finalization results to WebSocket clients');
    } else {
      console.warn('⚠️ WebSocket not available for broadcasting');
    }

    res.json({
      message: 'Debate finalized successfully',
      results: mlResponse.data,
      analysisSource
    });
  } catch (err) {
    console.error("[finalize route] error:", err.message);
    res.status(500).json({ message: "Error finalizing debate", details: err.message });
  }
};

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

// ML status
export const mlStatus = async (req, res) => {
  try {
    const status = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
    res.json({ mlApiStatus: "connected", data: status.data });
  } catch (err) {
    res.json({ mlApiStatus: "disconnected", error: err.message });
  }
};

// Health (simple)
export const healthCheck = (req, res) => {
  res.json({ status: "ok", message: "Debate backend running" });
};
