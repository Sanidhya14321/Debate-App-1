// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma.js";
import generateColor from "../utils/generateColor.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Create admin user on startup if it doesn't exist
export const createInitialUsers = async () => {
  try {
    let admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      admin = await prisma.user.create({
        data: {
        username: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        color: generateColor(),
        role: 'admin'
        }
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
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, color }
    });

    res.json({ id: user.id, username: user.username, email: user.email, color: user.color });
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.color) {
      await prisma.user.update({
        where: { id: user.id },
        data: { color: generateColor() }
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, color: user.color || generateColor(), role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, color: user.color, role: user.role });
  } catch (err) {
    console.error("[login]", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
