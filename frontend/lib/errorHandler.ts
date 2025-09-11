// lib/errorHandler.ts
import { toast } from 'sonner';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleApiError(error: unknown, context?: string): string {
  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      const message = 'Connection failed. Please check your internet connection.';
      toast.error(message);
      return message;
    }
    
    if (error.name === 'AuthenticationError' || error.message.includes('401')) {
      const message = 'Authentication failed. Please log in again.';
      toast.error(message);
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
      return message;
    }
    
    if (error.name === 'ValidationError' || error.message.includes('400')) {
      const message = error.message || 'Invalid input. Please check your data.';
      toast.error(message);
      return message;
    }
    
    // Generic error handling
    const message = error.message || 'An unexpected error occurred';
    toast.error(message);
    return message;
  }
  
  // Fallback for unknown error types
  const message = 'An unexpected error occurred';
  toast.error(message);
  return message;
}

export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, context);
      return null;
    }
  };
}

// Retry logic for failed requests
export async function retryRequest<T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === maxRetries - 1) break;
      
      // Don't retry on authentication or validation errors
      if (lastError.name === 'AuthenticationError' || 
          lastError.name === 'ValidationError' ||
          lastError.message.includes('401') ||
          lastError.message.includes('400')) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError!;
}
