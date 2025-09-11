// middleware/errorLogger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: req ? {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      user: req.user?.id || 'anonymous'
    } : null,
    environment: process.env.NODE_ENV || 'development'
  };

  // Log to console
  console.error(`[ERROR ${timestamp}]`, error.message);
  
  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    try {
      const logDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (logErr) {
      console.error('Failed to write error log:', logErr.message);
    }
  }
};

export default logError;
