import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Hardcoded admin credentials (NOT stored in database)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
  email: process.env.ADMIN_EMAIL || "admin@debateapp.com"
};

export const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized - No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin' || decoded.username !== ADMIN_CREDENTIALS.username) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

// Admin login function
export const adminLogin = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: "Username and password required" 
      });
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create JWT token for admin
      const token = jwt.sign(
        { 
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ 
        message: "Invalid admin credentials" 
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: "Login failed: " + error.message 
    });
  }
};

// Check if admin is authenticated
export const checkAdminAuth = (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
};
