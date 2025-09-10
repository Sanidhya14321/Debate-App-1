// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

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

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMessage = "API error";
    try {
      const err = await res.json();
      if (err?.message) errorMessage = err.message;
    } catch {}
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json();
  return null;
}
