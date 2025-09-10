"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { UI_CONFIG } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);

    try {
      // Use AuthContext login method which handles the API call internally
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("Welcome back!");
        router.replace("/debates");
      } else {
        toast.error(result.error || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-white/10 shadow-2xl bg-black/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-4 rounded-full bg-white/5 border border-white/10"
              >
                <LogIn className="h-10 w-10" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <p className="text-gray-400 text-lg">
              Sign in to continue your <span style={{ color: UI_CONFIG.SECONDARY_COLOR }} className="font-semibold">debate journey</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-white font-medium">
                  <Mail className="h-4 w-4" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-white font-medium">
                  <Lock className="h-4 w-4" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full text-black font-semibold py-3 rounded-xl transition-all duration-300"
                style={{ backgroundColor: UI_CONFIG.PRIMARY_COLOR }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign In to Arena
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                New to the platform?{" "}
                <Link
                  href="/register"
                  className="font-medium transition-colors hover:underline"
                  style={{ color: UI_CONFIG.SECONDARY_COLOR }}
                >
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
