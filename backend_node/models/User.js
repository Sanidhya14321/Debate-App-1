// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  color: String, // hex color code
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  recentDebates: [{
    debateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate' },
    topic: String,
    result: String, // 'won', 'lost', 'draw'
    score: Number,
    participatedAt: { type: Date, default: Date.now },
    opponent: String, // opponent username
    analysisSource: String // 'ai' or 'fallback'
  }],
  stats: {
    totalDebates: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
