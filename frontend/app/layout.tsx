import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/navigation";
import { SonnerProvider } from "@/components/ui/sonner-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Footer from "@/components/footer";
import { AnimatedBackground } from "@/components/animated-background";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Debate Practice Platform",
    template: "%s | Debate Practice Platform",
  },
  description: "Practice structured debates, review judged outcomes, and track progress over time.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: appUrl,
    title: "Debate Practice Platform",
    description: "Practice structured debates, review judged outcomes, and track progress over time.",
    siteName: "Debate Practice Platform",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="theme-editorial-brutal min-h-screen bg-background text-foreground antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AnimatedBackground />
          <ErrorBoundary>
            <AuthProvider>
              <Navigation />
              <main className="flex-1 min-h-screen">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <Footer />
              <SonnerProvider />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
