import { getToken } from "./auth";
import { API_URL } from "./api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "API error");
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json();
  return null;
}
