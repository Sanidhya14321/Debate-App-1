// controllers/achievementController.js
import { Achievement, UserAchievement } from "../models/Achievement.js";
import User from "../models/User.js";
import Debate from "../models/Debate.js";

// Get user's achievements
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement')
      .sort({ unlockedAt: -1 });
    
    const totalPoints = userAchievements
      .filter(ua => ua.isUnlocked)
      .reduce((sum, ua) => sum + ua.achievement.points, 0);
    
    const unlockedCount = userAchievements.filter(ua => ua.isUnlocked).length;
    const totalAchievements = await Achievement.countDocuments({ isActive: true });
    
    res.json({
      achievements: userAchievements,
      stats: {
        totalPoints,
        unlockedCount,
        totalAchievements,
        completionRate: Math.round((unlockedCount / totalAchievements) * 100)
      }
    });
  } catch (error) {
    console.error('[get user achievements]', error);
    res.status(500).json({ message: 'Failed to fetch user achievements' });
  }
};

// Get all available achievements
export const getAllAchievements = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, rarity } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    
    const achievements = await Achievement.find(query)
      .sort({ points: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Achievement.countDocuments(query);
    
    res.json({
      achievements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('[get all achievements]', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
};

// Check and award achievements for a user
export const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const newAchievements = await checkUserAchievements(userId);
    
    res.json({
      message: 'Achievements checked',
      newAchievements: newAchievements.length,
      achievements: newAchievements
    });
  } catch (error) {
    console.error('[check achievements]', error);
    res.status(500).json({ message: 'Failed to check achievements' });
  }
};

// Get achievement leaderboard
export const getAchievementLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const leaderboard = await UserAchievement.aggregate([
      { $match: { isUnlocked: true } },
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievement',
          foreignField: '_id',
          as: 'achievementData'
        }
      },
      { $unwind: '$achievementData' },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$achievementData.points' },
          achievementCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $project: {
          user: {
            _id: '$userData._id',
            username: '$userData.username',
            color: '$userData.color'
          },
          totalPoints: 1,
          achievementCount: 1
        }
      },
      { $sort: { totalPoints: -1, achievementCount: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: (page - 1) * limit + index + 1
    }));
    
    res.json({
      leaderboard: rankedLeaderboard,
      currentPage: page
    });
  } catch (error) {
    console.error('[get achievement leaderboard]', error);
    res.status(500).json({ message: 'Failed to fetch achievement leaderboard' });
  }
};

// Internal function to check and award achievements
export const checkUserAchievements = async (userId) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    const newAchievements = [];
    
    for (const achievement of achievements) {
      const existingProgress = await UserAchievement.findOne({
        user: userId,
        achievement: achievement._id
      });
      
      if (existingProgress && existingProgress.isUnlocked) {
        continue; // Already unlocked
      }
      
      const shouldUnlock = await checkAchievementCriteria(userId, achievement);
      
      if (shouldUnlock) {
        if (existingProgress) {
          existingProgress.isUnlocked = true;
          existingProgress.unlockedAt = new Date();
          existingProgress.progress = achievement.criteria.value || 1;
          await existingProgress.save();
        } else {
          const newUserAchievement = new UserAchievement({
            user: userId,
            achievement: achievement._id,
            progress: achievement.criteria.value || 1,
            isUnlocked: true,
            unlockedAt: new Date()
          });
          await newUserAchievement.save();
        }
        
        newAchievements.push({
          achievement,
          unlockedAt: new Date()
        });
        
        console.log(`🏆 User ${userId} unlocked achievement: ${achievement.name}`);
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Check if user meets criteria for specific achievement
const checkAchievementCriteria = async (userId, achievement) => {
  try {
    const { type, value } = achievement.criteria;
    
    switch (type) {
      case 'debate_count':
        const debateCount = await Debate.countDocuments({
          joinedUsers: userId,
          status: 'completed'
        });
        return debateCount >= value;
        
      case 'win_streak':
        // Get user's recent debates and check for consecutive wins
        const recentDebates = await Debate.find({
          joinedUsers: userId,
          status: 'completed'
        })
        .populate('results')
        .sort({ createdAt: -1 })
        .limit(value * 2); // Get more than needed to check streak
        
        let currentStreak = 0;
        for (const debate of recentDebates) {
          if (debate.results && debate.results.winner === userId) {
            currentStreak++;
            if (currentStreak >= value) return true;
          } else {
            break; // Streak broken
          }
        }
        return false;
        
      case 'score_threshold':
        // Check if user has achieved a high average score
        const userDebates = await Debate.find({
          joinedUsers: userId,
          status: 'completed',
          'arguments.user': userId
        });
        
        let totalScore = 0;
        let argumentCount = 0;
        
        userDebates.forEach(debate => {
          debate.arguments.forEach(arg => {
            if (arg.user.toString() === userId) {
              totalScore += arg.score;
              argumentCount++;
            }
          });
        });
        
        const averageScore = argumentCount > 0 ? totalScore / argumentCount : 0;
        return averageScore >= value;
        
      case 'tournament_win':
        // Check if user has won tournaments
        const Tournament = (await import('../models/Tournament.js')).default;
        const tournamentWins = await Tournament.countDocuments({
          winner: userId
        });
        return tournamentWins >= value;
        
      case 'argument_count':
        const totalArguments = await Debate.aggregate([
          { $match: { joinedUsers: userId } },
          { $unwind: '$arguments' },
          { $match: { 'arguments.user': userId } },
          { $count: 'total' }
        ]);
        
        const argCount = totalArguments[0]?.total || 0;
        return argCount >= value;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking achievement criteria:', error);
    return false;
  }
};

// Initialize default achievements
export const initializeDefaultAchievements = async () => {
  try {
    const defaultAchievements = [
      {
        name: "First Steps",
        description: "Complete your first debate",
        icon: "🎯",
        category: "milestone",
        rarity: "common",
        points: 10,
        criteria: { type: "debate_count", value: 1 }
      },
      {
        name: "Debate Veteran",
        description: "Complete 10 debates",
        icon: "🏛️",
        category: "milestone",
        rarity: "rare",
        points: 50,
        criteria: { type: "debate_count", value: 10 }
      },
      {
        name: "Master Debater",
        description: "Complete 50 debates",
        icon: "👑",
        category: "milestone",
        rarity: "epic",
        points: 200,
        criteria: { type: "debate_count", value: 50 }
      },
      {
        name: "Winning Streak",
        description: "Win 3 debates in a row",
        icon: "🔥",
        category: "skill",
        rarity: "rare",
        points: 75,
        criteria: { type: "win_streak", value: 3 }
      },
      {
        name: "Unstoppable",
        description: "Win 5 debates in a row",
        icon: "⚡",
        category: "skill",
        rarity: "epic",
        points: 150,
        criteria: { type: "win_streak", value: 5 }
      },
      {
        name: "High Scorer",
        description: "Achieve an average argument score of 0.8",
        icon: "⭐",
        category: "skill",
        rarity: "rare",
        points: 100,
        criteria: { type: "score_threshold", value: 0.8 }
      },
      {
        name: "Tournament Champion",
        description: "Win a tournament",
        icon: "🏆",
        category: "tournament",
        rarity: "epic",
        points: 300,
        criteria: { type: "tournament_win", value: 1 }
      },
      {
        name: "Prolific Arguer",
        description: "Submit 100 arguments",
        icon: "📝",
        category: "debate",
        rarity: "rare",
        points: 80,
        criteria: { type: "argument_count", value: 100 }
      }
    ];
    
    for (const achData of defaultAchievements) {
      const existing = await Achievement.findOne({ name: achData.name });
      if (!existing) {
        const achievement = new Achievement(achData);
        await achievement.save();
        console.log(`✅ Created achievement: ${achData.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
};
