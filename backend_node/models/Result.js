// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  debateId: { type: String, required: true, unique: true },
  winner: String,
  scores: { type: Object }, // New structure with username keys
  totals: { type: Object }, // Participant totals
  coherence: { type: Object }, // Coherence score and rating
  analysisSource: { type: String, enum: ['ml', 'ai', 'fallback'], default: 'ml' },
  finalizedAt: { type: Date, default: Date.now },
  
  // Legacy fields for backward compatibility
  logicScore: Number,
  persuasivenessScore: Number,
  engagementScore: Number,
  evaluatedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
