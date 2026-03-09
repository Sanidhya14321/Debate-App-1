import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import debateRoutes from "./routes/debateRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import miscRoutes from "./routes/miscRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import { createInitialUsers } from "./controllers/authController.js";
import errorHandler from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = createServer(app);

app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN,
      "http://localhost:3000",
      "https://debate-app-1.vercel.app",
      "https://debate-app-1-git-main-sanidhya14321.vercel.app"
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  })
);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      "http://localhost:3000",
      "https://debate-app-1.vercel.app",
      "https://debate-app-1-git-main-sanidhya14321.vercel.app"
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

const PORT = Number(process.env.PORT || 5000);
const KEEP_ALIVE_TIMEOUT = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 65000);
const HEADERS_TIMEOUT = Number(process.env.HEADERS_TIMEOUT_MS || 66000);
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT_MS || 120000);

const shutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown.`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("HTTP server closed and database disconnected.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000)).unref();
};

const boot = async () => {
  try {
    await prisma.$connect();
    await createInitialUsers();

    setupSocketHandlers(io);
    app.set("io", io);

    app.use(process.env.MISC_ROUTE || "/misc", miscRoutes);
    app.use(process.env.AUTH_ROUTE || "/auth", authRoutes);
    app.use(process.env.DEBATES_ROUTE || "/debates", debateRoutes);
    app.use(process.env.USERS_ROUTE || "/users", userRoutes);

    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    app.use((req, res) => {
      res.status(404).json({ message: "Not Found" });
    });

    app.use(errorHandler);

    server.listen(PORT, () => {
      server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
      server.headersTimeout = HEADERS_TIMEOUT;
      server.requestTimeout = REQUEST_TIMEOUT;

      console.log(`Server running on port ${PORT}`);
      console.log("WebSocket server ready");
    });

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to boot server:", error);
    process.exit(1);
  }
};

boot();
