// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Debate creation limiter
export const debateCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 debate creations per 15 minutes
  message: {
    error: 'Too many debates created, please try again later.',
    retryAfter: '15 minutes'
  },
});

// Argument submission limiter
export const argumentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 arguments per minute
  message: {
    error: 'Too many arguments submitted, please slow down.',
    retryAfter: '1 minute'
  },
});

// ML API limiter (more restrictive due to computational cost)
export const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 ML requests per minute
  message: {
    error: 'ML API rate limit exceeded, please try again later.',
    retryAfter: '1 minute'
  },
});
