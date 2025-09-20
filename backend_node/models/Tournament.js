// models/Tournament.js
import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'active', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  participants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    registeredAt: { type: Date, default: Date.now },
    eliminated: { type: Boolean, default: false }
  }],
  maxParticipants: { type: Number, required: true, min: 4, max: 128 },
  prize: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  rounds: { type: Number, required: true, min: 1 },
  currentRound: { type: Number, default: 0 },
  entryFee: { type: Number, default: 0, min: 0 },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdByType: { 
    type: String, 
    enum: ['admin', 'user'], 
    required: true,
    default: 'user'
  },
  
  // Rules and settings
  rules: {
    timeLimit: { type: Number, default: 30 }, // minutes
    maxArguments: { type: Number, default: 10 },
    topics: [String]
  },
  
  // Tournament structure
  bracket: [{
    round: Number,
    matches: [{
      participant1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      participant2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      debate: { type: mongoose.Schema.Types.ObjectId, ref: "Debate" },
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' }
    }]
  }],
  
  // Final results
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  runnerUp: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for active participant count
tournamentSchema.virtual('activeParticipantCount').get(function() {
  return this.participants.filter(p => !p.eliminated).length;
});

// Indexes for better query performance
tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ 'participants.user': 1 });

// Update the updatedAt field before saving
tournamentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endDate is after startDate
tournamentSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

const Tournament = mongoose.model("Tournament", tournamentSchema);
export default Tournament;
