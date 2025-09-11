// middleware/healthCheck.js
import mongoose from 'mongoose';
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || "https://debate-app-ml.hf.space";

export const detailedHealthCheck = async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      mlApi: 'unknown'
    },
    memory: process.memoryUsage(),
    version: process.version
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'connected';
    } else {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check ML API
  try {
    const mlResponse = await axios.get(`${ML_API_URL}/health`, { 
      timeout: 5000,
      headers: { 'User-Agent': 'Debate-App-Backend/1.0' }
    });
    health.services.mlApi = mlResponse.status === 200 ? 'connected' : 'error';
  } catch (error) {
    health.services.mlApi = 'disconnected';
    // Don't mark as degraded since ML API is optional
  }

  // Set overall status
  if (health.services.database === 'disconnected' || health.services.database === 'error') {
    health.status = 'unhealthy';
  } else if (health.services.mlApi === 'error') {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
};

export const readinessCheck = async (req, res) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database not connected'
      });
    }

    // Check if server can handle requests
    const testQuery = await mongoose.connection.db.admin().ping();
    if (!testQuery.ok) {
      return res.status(503).json({
        status: 'not ready',
        message: 'Database ping failed'
      });
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
};

export const livenessCheck = (req, res) => {
  // Simple liveness check - just return OK if server is running
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
