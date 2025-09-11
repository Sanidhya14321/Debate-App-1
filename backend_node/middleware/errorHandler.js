// middleware/errorHandler.js
import logError from './errorLogger.js';

export default function errorHandler(err, req, res, next) {
  // Log the error with context
  logError(err, req);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;
  
  let message = 'Internal Server Error';
  if (status < 500 || isDevelopment) {
    message = err.message || message;
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: isDevelopment ? err.errors : undefined 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID format' 
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ 
      error: 'Duplicate entry' 
    });
  }
  
  res.status(status).json({ 
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
}
