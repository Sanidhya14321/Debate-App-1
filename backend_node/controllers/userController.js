// controllers/userController.js
import User from "../models/User.js";
import Debate from "../models/Debate.js";
import Result from "../models/Result.js";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
  try {
    // Disable caching so browser always fetches fresh data
    res.set("Cache-Control", "no-store");

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's debate statistics
    const userId = req.user.id;
    
    // Get all debates user participated in
    const userDebates = await Debate.find({
      participants: { $in: [userId] },
      isFinalized: true
    }).populate('result').sort({ createdAt: -1 });

    // Calculate statistics
    let totalDebates = userDebates.length;
    let wins = 0;
    let totalScore = 0;
    let totalArguments = 0;
    
    // Get recent debates with detailed results
    const recentDebates = [];
    
    for (const debate of userDebates.slice(0, 5)) { // Last 5 debates
      try {
        // Get the result for this debate
        const result = await Result.findOne({ debateId: debate._id });
        
        if (result) {
          // Count user's arguments in this debate
          const userArgs = result.arguments.filter(arg => 
            arg.userId && arg.userId.toString() === userId
          );
          totalArguments += userArgs.length;
          
          // Calculate user's average score in this debate
          let userScore = 0;
          if (userArgs.length > 0) {
            const scores = userArgs.map(arg => {
              if (typeof arg.score === 'number') return arg.score;
              if (typeof arg.score === 'object' && arg.score.total) return arg.score.total;
              return 0;
            });
            userScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            totalScore += userScore;
          }
          
          // Determine if user won
          let userResult = 'draw';
          if (result.winner === 'for' || result.winner === 'against') {
            // Check if user was on winning side
            const userSide = userArgs.length > 0 ? userArgs[0].side : null;
            if (userSide === result.winner) {
              userResult = 'win';
              wins++;
            } else if (userSide) {
              userResult = 'loss';
            }
          }
          
          // Find opponent
          const opponentId = debate.participants.find(p => p.toString() !== userId);
          let opponentName = 'Unknown';
          if (opponentId) {
            const opponent = await User.findById(opponentId).select('username');
            opponentName = opponent ? opponent.username : 'Unknown';
          }
          
          recentDebates.push({
            id: debate._id,
            topic: debate.topic,
            result: userResult,
            score: Math.round(userScore * 10) / 10,
            date: debate.createdAt,
            opponent: opponentName,
            finalizedAt: result.finalizedAt || debate.updatedAt
          });
        }
      } catch (err) {
        console.error('Error processing debate result:', err);
      }
    }
    
    const winRate = totalDebates > 0 ? Math.round((wins / totalDebates) * 100) : 0;
    const averageScore = totalDebates > 0 ? Math.round((totalScore / totalDebates) * 10) / 10 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    for (const debate of recentDebates) {
      if (debate.result === 'win') {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Determine rank based on performance
    let rank = 'Bronze';
    if (winRate >= 80 && totalDebates >= 10) rank = 'Diamond';
    else if (winRate >= 70 && totalDebates >= 8) rank = 'Platinum';
    else if (winRate >= 60 && totalDebates >= 5) rank = 'Gold';
    else if (winRate >= 50 && totalDebates >= 3) rank = 'Silver';
    
    const stats = {
      totalDebates,
      wins,
      losses: totalDebates - wins,
      winRate,
      averageScore,
      streak: currentStreak,
      rank,
      totalArguments
    };

    res.json({ 
      username: user.username, 
      email: user.email, 
      color: user.color,
      stats,
      recentDebates
    });
  } catch (err) {
    console.error("[get profile]", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
