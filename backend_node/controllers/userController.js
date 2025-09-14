// controllers/userController.js
import User from "../models/User.js";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
  try {
    // Disable caching so browser always fetches fresh data
    res.set("Cache-Control", "no-store");

    const user = await User.findById(req.user.id).select("-password").populate('recentDebates.debateId', 'topic');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use the new user model structure with recentDebates and stats
    const recentDebates = user.recentDebates || [];
    const stats = user.stats || {
      totalDebates: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      averageScore: 0
    };

    // Calculate derived stats
    const winRate = stats.totalDebates > 0 ? Math.round((stats.wins / stats.totalDebates) * 100) : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    for (const debate of recentDebates) {
      if (debate.result === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Determine rank based on performance
    let rank = 'Bronze';
    if (winRate >= 80 && stats.totalDebates >= 10) rank = 'Diamond';
    else if (winRate >= 70 && stats.totalDebates >= 8) rank = 'Platinum';
    else if (winRate >= 60 && stats.totalDebates >= 5) rank = 'Gold';
    else if (winRate >= 50 && stats.totalDebates >= 3) rank = 'Silver';

    const enhancedStats = {
      ...stats,
      winRate,
      streak: currentStreak,
      rank
    };

    // Format recent debates for response
    const formattedDebates = recentDebates.map(debate => ({
      id: debate.debateId?._id || debate.debateId,
      topic: debate.debateId?.topic || debate.topic,
      result: debate.result,
      score: debate.score,
      date: debate.participatedAt,
      opponent: debate.opponent,
      analysisSource: debate.analysisSource
    }));

    res.json({ 
      username: user.username, 
      email: user.email, 
      color: user.color,
      stats: enhancedStats,
      recentDebates: formattedDebates
    });
  } catch (err) {
    console.error("[get profile]", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
