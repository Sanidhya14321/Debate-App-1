import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/navigation";
import { SonnerProvider } from "@/components/ui/sonner-provider";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "AI Debate Platform",
  description: "AI-powered debating platform with intelligent scoring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <Navigation />
            <main className="min-h-screen">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <SonnerProvider />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
