import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/navigation";
import { SonnerProvider } from "@/components/ui/sonner-provider";

export const metadata = {
  title: "AI Debate Platform",
  description: "AI-powered debating platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Navigation />
          <main className="container mx-auto p-4">{children}</main>
          <SonnerProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
