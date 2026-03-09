import { prisma } from "../lib/prisma.js";

export const detailedHealthCheck = async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
      groq: process.env.GROQ_API_KEY ? "configured" : "missing_key"
    },
    memory: process.memoryUsage(),
    version: process.version
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "connected";
  } catch {
    health.services.database = "error";
    health.status = "unhealthy";
  }

  if (health.services.groq === "missing_key" && health.status !== "unhealthy") {
    health.status = "degraded";
  }

  const statusCode = health.status === "unhealthy" ? 503 : 200;
  res.status(statusCode).json(health);
};

export const readinessCheck = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "not ready", error: error.message });
  }
};

export const livenessCheck = (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString(), uptime: process.uptime() });
};
