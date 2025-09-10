"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { apiFetch, UI_CONFIG } from "@/lib/api"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, Mail, User, Lock, Shield } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!username.trim()) {
      toast.error("Username is required")
      return false
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters")
      return false
    }
    if (!email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    if (!password) {
      toast.error("Password is required")
      return false
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return false
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      })
      
      toast.success("Registration successful! Please log in.")
      router.push("/login")
    } catch (err: any) {
      toast.error(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

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
                <UserPlus className="h-10 w-10" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Join the Arena
            </CardTitle>
            <p className="text-gray-400 text-lg">
              Create your account and start your <span style={{ color: UI_CONFIG.SECONDARY_COLOR }} className="font-semibold">debate revolution</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-white font-medium">
                  <User className="h-4 w-4" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose your battle name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20"
                />
              </div>
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
                    placeholder="Create a strong password"
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-white font-medium">
                  <Shield className="h-4 w-4" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-white/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Enter the Arena
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium transition-colors hover:underline"
                  style={{ color: UI_CONFIG.SECONDARY_COLOR }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
