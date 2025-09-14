// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  debateId: { type: String, required: true, unique: true },
  winner: String,
  results: { type: Object }, // Main results structure with participant data
  analysisSource: { type: String, enum: ['ml', 'ai', 'fallback'], default: 'ml' },
  finalizedAt: { type: Date, default: Date.now },
  
  // Legacy compatibility fields
  scores: { type: Object }, // Legacy: username keys
  totals: { type: Object }, // Legacy: participant totals
  coherence: { type: Object }, // Legacy: coherence score and rating
  logicScore: Number,
  persuasivenessScore: Number,
  engagementScore: Number,
  evaluatedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
