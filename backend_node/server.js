// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import debateRoutes from "./routes/debateRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import miscRoutes from "./routes/miscRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import { initializeDefaultAchievements } from "./controllers/achievementController.js";
import errorHandler from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend_node directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan("dev"));

// Apply rate limiting to all requests
app.use(generalLimiter);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/debateDB";

console.log('🔍 Environment check:');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

connectDB(MONGODB_URI).then(async () => {
  // Initialize default achievements
  await initializeDefaultAchievements();

  // Setup Socket.IO handlers
  setupSocketHandlers(io);

  // Make io accessible to routes
  app.set('io', io);

  // mount routes using environment variables
  app.use(process.env.MISC_ROUTE || "/misc", miscRoutes);         // health + ml-status + root
  app.use(process.env.AUTH_ROUTE || "/auth", authRoutes);       // /auth/register, /auth/login
  app.use(process.env.DEBATES_ROUTE || "/debates", debateRoutes);   // debates endpoints
  app.use(process.env.USERS_ROUTE || "/users", userRoutes);    // profile (protected)
  app.use("/tournaments", tournamentRoutes); // tournament endpoints
  app.use("/achievements", achievementRoutes); // achievement endpoints
  app.use("/admin", adminRoutes);
  app.use("/leaderboard", leaderboardRoutes);
  app.use("/analytics", analyticsRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // fallback
  app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
  });

  // error handler
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 WebSocket server ready`);
  });
});
