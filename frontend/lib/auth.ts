"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Hook to protect pages
 */
export function useAuthGuard() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  return checked; // true if auth checked & token exists
}
