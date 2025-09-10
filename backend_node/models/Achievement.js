// models/Achievement.js
import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // emoji or icon name
  category: { 
    type: String, 
    enum: ['debate', 'social', 'skill', 'milestone', 'tournament'], 
    required: true 
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  points: { type: Number, required: true, min: 0 },
  
  // Achievement criteria
  criteria: {
    type: { 
      type: String, 
      enum: ['debate_count', 'win_streak', 'score_threshold', 'tournament_win', 'argument_count', 'custom'],
      required: true 
    },
    value: { type: Number }, // threshold value
    customCheck: { type: String } // for custom achievements
  },
  
  // Metadata
  isHidden: { type: Boolean, default: false }, // hidden until unlocked
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Achievement = mongoose.model("Achievement", achievementSchema);

// User Achievement Progress
const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement", required: true },
  progress: { type: Number, default: 0 }, // current progress towards achievement
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate user-achievement pairs
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);

export { Achievement, UserAchievement };
