// models/Debate.js
import mongoose from "mongoose";

const debateSchema = new mongoose.Schema({
  topic: String,
  description: String,
  status: { type: String, default: "waiting" },
  isPrivate: { type: Boolean, default: false },
  inviteCode: String,
  createdAt: { type: Date, default: Date.now },
  joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startedAt: Date,
  finalizedAt: Date,
  maxUsers: { type: Number, default: 2 },

  arguments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      score: Object,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  finalizationRequests: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    requestedAt: { type: Date, default: Date.now }
  }],

  result: { type: Object } // optional: store ML results
});

const Debate = mongoose.model("Debate", debateSchema);
export default Debate;
