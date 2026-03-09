// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getClientKey = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip;
};

const shouldSkipGeneralLimit = (req) => req.path === '/health' || req.path.startsWith('/misc/health');

const GENERAL_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, 60 * 1000);
const GENERAL_MAX = toPositiveInt(process.env.RATE_LIMIT_GENERAL_MAX, 600);
const AUTH_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 15 * 60 * 1000);
const AUTH_MAX = toPositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 100);
const DEBATE_CREATION_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_DEBATE_CREATION_WINDOW_MS, 15 * 60 * 1000);
const DEBATE_CREATION_MAX = toPositiveInt(process.env.RATE_LIMIT_DEBATE_CREATION_MAX, 120);
const ARGUMENT_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_ARGUMENT_WINDOW_MS, 60 * 1000);
const ARGUMENT_MAX = toPositiveInt(process.env.RATE_LIMIT_ARGUMENT_MAX, 120);
const ML_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_ML_WINDOW_MS, 60 * 1000);
const ML_MAX = toPositiveInt(process.env.RATE_LIMIT_ML_MAX, 500);

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: GENERAL_WINDOW_MS,
  max: GENERAL_MAX,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: `${Math.ceil(GENERAL_WINDOW_MS / 60000)} minutes`
  },
  keyGenerator: getClientKey,
  skip: shouldSkipGeneralLimit,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: `${Math.ceil(AUTH_WINDOW_MS / 60000)} minutes`
  },
  keyGenerator: getClientKey,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Debate creation limiter
export const debateCreationLimiter = rateLimit({
  windowMs: DEBATE_CREATION_WINDOW_MS,
  max: DEBATE_CREATION_MAX,
  message: {
    error: 'Too many debates created, please try again later.',
    retryAfter: `${Math.ceil(DEBATE_CREATION_WINDOW_MS / 60000)} minutes`
  },
  keyGenerator: getClientKey,
});

// Argument submission limiter
export const argumentLimiter = rateLimit({
  windowMs: ARGUMENT_WINDOW_MS,
  max: ARGUMENT_MAX,
  message: {
    error: 'Too many arguments submitted, please slow down.',
    retryAfter: `${Math.ceil(ARGUMENT_WINDOW_MS / 60000)} minutes`
  },
  keyGenerator: getClientKey,
});

// ML API limiter (more restrictive due to computational cost)
export const mlLimiter = rateLimit({
  windowMs: ML_WINDOW_MS,
  max: ML_MAX,
  message: {
    error: 'ML API rate limit exceeded, please try again later.',
    retryAfter: `${Math.ceil(ML_WINDOW_MS / 60000)} minutes`
  },
  keyGenerator: getClientKey,
});

export const rateLimiterConfig = {
  GENERAL_WINDOW_MS,
  GENERAL_MAX,
  AUTH_WINDOW_MS,
  AUTH_MAX,
  DEBATE_CREATION_WINDOW_MS,
  DEBATE_CREATION_MAX,
  ARGUMENT_WINDOW_MS,
  ARGUMENT_MAX,
  ML_WINDOW_MS,
  ML_MAX,
};
