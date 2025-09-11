// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://debate-app-1.onrender.com";
export const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "https://debate-app-ml.hf.space";

// API Routes
export const API_ROUTES = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_ROUTE || "/auth",
  DEBATES: process.env.NEXT_PUBLIC_DEBATES_ROUTE || "/debates",
  USERS: process.env.NEXT_PUBLIC_USERS_ROUTE || "/users",
  ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_ROUTE || "/analytics",
};

// UI Configuration
export const UI_CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Debate Revolution",
  PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#2563eb",
  SECONDARY_COLOR: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#10b981",
  ACCENT_COLOR: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#f59e0b",
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMessage = "API error";
      const errorCode = res.status;
      
      try {
        const err = await res.json();
        if (err?.message) errorMessage = err.message;
        if (err?.error) errorMessage = err.error;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = res.statusText || `HTTP ${res.status}`;
      }
      
      // Handle specific status codes
      if (errorCode === 401) {
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (errorCode === 403) {
        throw new Error('Access denied. You do not have permission to perform this action.');
      }
      
      if (errorCode === 404) {
        throw new Error('Resource not found.');
      }
      
      if (errorCode === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      if (errorCode >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) return res.json();
    return null;
    
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    // Handle abort errors (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    
    // Re-throw other errors
    throw error;
  }
}
