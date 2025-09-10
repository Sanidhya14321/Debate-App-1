// controllers/userController.js
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    // Disable caching so browser always fetches fresh data
    res.set("Cache-Control", "no-store");

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Make sure stats exists
    const stats = {
      winRate: user.winRate || 0,
      totalDebates: user.totalDebates || 0
    };

    res.json({ 
      username: user.username, 
      email: user.email, 
      color: user.color,
      stats
    });
  } catch (err) {
    console.error("[get profile]", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
