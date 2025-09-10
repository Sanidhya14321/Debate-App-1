// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Debate validation rules
export const validateCreateDebate = [
  body('topic')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Topic must be between 5 and 500 characters')
    .escape(),
  
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  
  handleValidationErrors
];

export const validateAddArgument = [
  body('content')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Argument must be between 20 and 2000 characters')
    .escape(),
  
  param('id')
    .isMongoId()
    .withMessage('Invalid debate ID'),
  
  handleValidationErrors
];

export const validateJoinPrivateDebate = [
  body('inviteCode')
    .trim()
    .isLength({ min: 6, max: 8 })
    .withMessage('Invalid invite code format')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Invite code can only contain uppercase letters and numbers'),
  
  handleValidationErrors
];

// Parameter validation
export const validateDebateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid debate ID'),
  
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Sanitization helpers
export const sanitizeHtml = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

export const validateAndSanitizeText = (text, minLength = 1, maxLength = 1000) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }
  
  const sanitized = sanitizeHtml(text);
  
  if (sanitized.length < minLength) {
    throw new Error(`Text must be at least ${minLength} characters long`);
  }
  
  if (sanitized.length > maxLength) {
    throw new Error(`Text must not exceed ${maxLength} characters`);
  }
  
  return sanitized;
};
