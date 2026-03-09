import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const routes = [
    "",
    "/home",
    "/about",
    "/contact",
    "/debates",
    "/leaderboard",
    "/analytics",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.7,
    lastModified: new Date(),
  }));
}
