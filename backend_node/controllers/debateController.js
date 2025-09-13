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
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ error: "Debate not found" });

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
      score = mlResponse.data.score;
    } catch (mlErr) {
      console.warn("[ML API unavailable] using mock scoring:", mlErr.message);
      score = Math.random() * 2 - 1;
      // Don't fail the request, but log the error for monitoring
    }

    const newArgument = {
      user: req.user.id,
      content,
      score,
      createdAt: new Date()
    };

    debate.arguments.push(newArgument);
    await debate.save();

    // Populate user data for the new argument
    const populatedDebate = await Debate.findById(req.params.id)
      .populate('arguments.user', 'username color');
    
    const addedArgument = populatedDebate.arguments[populatedDebate.arguments.length - 1];

    // Broadcast to WebSocket clients
    const io = req.app.get('io');
    if (io && io.broadcastArgumentAdded) {
      io.broadcastArgumentAdded(req.params.id, {
        id: addedArgument._id,
        content: addedArgument.content,
        score: addedArgument.score,
        username: addedArgument.user?.username || 'Unknown',
        color: addedArgument.user?.color || '#333',
        createdAt: addedArgument.createdAt
      });
    }

    res.json({ 
      message: "Argument added successfully", 
      score,
      argument: {
        id: addedArgument._id,
        content: addedArgument.content,
        score: addedArgument.score,
        username: addedArgument.user?.username || 'Unknown',
        color: addedArgument.user?.color || '#333',
        createdAt: addedArgument.createdAt
      }
    });
  } catch (err) {
    console.error("[add argument] error details:", err);
    res.status(500).json({ message: "Error adding argument" });
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

    // Prepare arguments for ML
    if (debate.joinedUsers.length < 2) {
      return res.status(400).json({ error: "Debate requires at least two users to finalize." });
    }

    const userA_id = debate.joinedUsers[0]._id.toString();
    const userB_id = debate.joinedUsers[1]._id.toString();

    const args_a = debate.arguments
      .filter(arg => arg.user._id.toString() === userA_id)
      .map(arg => arg.content || "");

    const args_b = debate.arguments
      .filter(arg => arg.user._id.toString() === userB_id)
      .map(arg => arg.content || "");

    // Call ML API with retry logic
    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_API_URL}/finalize`, { 
        args_a: args_a,
        args_b: args_b
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!mlResponse.data) throw new Error("ML API returned empty response");
    } catch (mlErr) {
      console.error("[ML API Error]", mlErr.message);
      // Provide fallback results when ML API fails
      mlResponse = {
        data: {
          winner: mlArgs.length > 0 ? mlArgs[0].username : "No winner",
          logicScore: Math.random() * 100,
          persuasivenessScore: Math.random() * 100,
          engagementScore: Math.random() * 100,
          summary: "Results generated locally due to ML API unavailability"
        }
      };
    }

    debate.result = mlResponse.data;
    debate.status = "completed";
    await debate.save();

    // Save results in Result collection with debateId as string
    try {
      const { winner, logicScore, persuasivenessScore, engagementScore } = mlResponse.data;
      await Result.findOneAndUpdate(
        { debateId: debateId.toString() },
        {
          debateId: debateId.toString(),
          logicScore: logicScore ?? null,
          persuasivenessScore: persuasivenessScore ?? null,
          engagementScore: engagementScore ?? null,
          winner: winner ?? null
        },
        { upsert: true, new: true }
      );
    } catch (saveErr) {
      console.warn("[result save] could not persist to Result collection:", saveErr.message);
    }

    res.json(mlResponse.data);
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
