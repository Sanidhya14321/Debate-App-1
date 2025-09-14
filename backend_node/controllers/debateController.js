// controllers/debateController.js
import axios from "axios";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import dotenv from "dotenv";
dotenv.config();

const ML_API_URL = process.env.ML_API_URL || "https://debate-app-ml.hf.space";

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
    const mlArguments = debate.arguments.map(arg => ({
      username: arg.user?.username || "Anonymous",
      argumentText: arg.content || ""
    }));

    // Call ML API with retry logic
    let mlResponse;
    let analysisSource = 'ml';
    
    try {
      mlResponse = await axios.post(`${ML_API_URL}/finalize`, { 
        arguments: mlArguments
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
        // Attempt AI fallback using Genkit flow
        const { analyzeDebate } = await import('../../../frontend/ai/flows/debate-analysis.js');
        const aiResult = await analyzeDebate({ arguments: mlArguments });
        
        mlResponse = {
          data: {
            ...aiResult,
            analysisSource: 'ai'
          }
        };
        analysisSource = 'ai';
        console.log('🤖 AI fallback successful');
      } catch (aiErr) {
        console.error('❌ AI fallback failed:', aiErr.message);
        
        // Final fallback - basic scoring
        const usernames = [...new Set(debate.arguments.map(arg => arg.user?.username || "Anonymous"))];
        const fallbackWinner = usernames[Math.floor(Math.random() * usernames.length)];
        
        mlResponse = {
          data: {
            winner: fallbackWinner,
            scores: {
              A: {
                sentiment: { score: Math.random() * 100, rating: "Good" },
                clarity: { score: Math.random() * 100, rating: "Good" },
                vocab_richness: { score: Math.random() * 100, rating: "Good" },
                avg_word_len: { score: Math.random() * 100, rating: "Good" }
              },
              B: {
                sentiment: { score: Math.random() * 100, rating: "Good" },
                clarity: { score: Math.random() * 100, rating: "Good" },
                vocab_richness: { score: Math.random() * 100, rating: "Good" },
                avg_word_len: { score: Math.random() * 100, rating: "Good" }
              }
            },
            totals: { A: Math.random() * 100, B: Math.random() * 100 },
            coherence: { score: Math.random() * 100, rating: "Good" },
            summary: "Results generated locally due to ML API unavailability",
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
          // Legacy fields for backward compatibility
          logicScore: totals?.A ?? null,
          persuasivenessScore: totals?.B ?? null,
          engagementScore: coherence?.score ?? null
        },
        { upsert: true, new: true }
      );
    } catch (saveErr) {
      console.warn("[result save] could not persist to Result collection:", saveErr.message);
    }

    // Broadcast results via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`debate_${debateId}`).emit('debateFinalized', {
        debateId: debateId.toString(),
        results: mlResponse.data
      });
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
    const results = await Result.findOne({ debateId: req.params.id });
    res.json(results);
  } catch (err) {
    console.error("[get results]", err.message);
    res.status(500).json({ message: "Failed to fetch results" });
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
