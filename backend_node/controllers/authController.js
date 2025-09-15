// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import generateColor from "../utils/generateColor.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Create admin user on startup if it doesn't exist
export const createInitialUsers = async () => {
  try {
    // Admin User
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      admin = await User.create({
        username: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        color: generateColor(),
        role: 'admin',
      });
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
};


export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const color = generateColor();
    const user = await User.create({ username, email, password: hashedPassword, color });

    res.json({ id: user._id, username: user.username, email: user.email, color: user.color });
  } catch (err) {
    console.error("[register]", err.message);
    // keep the original behavior (400 on duplicate/invalid)
    res.status(400).json({ message: "User exists or invalid data", details: err.message });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.color) {
      user.color = generateColor();
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, color: user.color, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, color: user.color, role: user.role });
  } catch (err) {
    console.error("[login]", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
