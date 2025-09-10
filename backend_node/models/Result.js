// models/Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  debateId: String,
  logicScore: Number,
  persuasivenessScore: Number,
  engagementScore: Number,
  winner: String,
  evaluatedAt: { type: Date, default: Date.now }
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
