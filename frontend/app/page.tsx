"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UI_CONFIG } from "@/lib/api";
import { 
  MessageSquare, 
  Trophy, 
  Users, 
  Zap, 
  Brain, 
  Target,
  ArrowRight,
  Star,
  Globe,
  Shield,
  TrendingUp,
  Award,
  BarChart3,
  Plus
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => setToken(localStorage.getItem("token")), []);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-20">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-32"
        >
          <div className="mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Brain className="h-5 w-5" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
              <span className="text-sm font-medium text-white">AI-Powered Debate Platform</span>
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8"
          >
            {UI_CONFIG.APP_NAME}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Experience intelligent debates with real-time AI analysis, comprehensive scoring, 
            and competitive tournaments. Elevate your critical thinking skills.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            {token ? (
              <>
                <Button 
                  onClick={() => router.push("/debates")} 
                  size="lg" 
                  className="gap-3 px-8 py-4 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: UI_CONFIG.PRIMARY_COLOR }}
                >
                  <Plus className="h-6 w-6" /> Create Debate
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/debates")}
                  className="gap-3 border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded-xl"
                >
                  <Users className="h-6 w-6" /> Browse Debates
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => router.push("/register")} 
                  size="lg" 
                  className="gap-3 px-8 py-4 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: UI_CONFIG.PRIMARY_COLOR }}
                >
                  <Star className="h-6 w-6" /> Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="gap-3 border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded-xl"
                >
                  <Shield className="h-6 w-6" /> Sign In
                </Button>
              </>
            )}
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-32"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Active Debaters", value: "10K+", color: UI_CONFIG.PRIMARY_COLOR },
              { icon: MessageSquare, label: "Debates Hosted", value: "50K+", color: UI_CONFIG.SECONDARY_COLOR },
              { icon: Trophy, label: "Tournaments", value: "500+", color: UI_CONFIG.ACCENT_COLOR },
              { icon: BarChart3, label: "AI Analyses", value: "1M+", color: UI_CONFIG.PRIMARY_COLOR }
            ].map((stat, index) => (
              <Card key={index} className="p-8 text-center bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <stat.icon className="h-10 w-10 mx-auto mb-4" style={{ color: stat.color }} />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mb-32"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience debate like never before with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Brain,
                title: "Neural Analysis",
                description: "Advanced sentiment analysis and argument strength evaluation using transformer models and deep learning algorithms.",
                color: UI_CONFIG.PRIMARY_COLOR
              },
              {
                icon: Zap,
                title: "Real-Time Scoring",
                description: "Instant feedback on argument quality, logical coherence, and persuasiveness with comprehensive scoring metrics.",
                color: UI_CONFIG.SECONDARY_COLOR
              },
              {
                icon: Target,
                title: "Smart Matching",
                description: "Intelligent opponent matching based on skill level, debate style, and topic expertise for balanced competitions.",
                color: UI_CONFIG.ACCENT_COLOR
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 + index * 0.2 }}
              >
                <Card className="p-10 text-center bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group h-full">
                  <div className="mb-8">
                    <feature.icon 
                      className="h-16 w-16 mx-auto group-hover:scale-110 transition-transform duration-300" 
                      style={{ color: feature.color }} 
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Features */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="p-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <Trophy className="h-16 w-16" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                <div>
                  <h3 className="text-2xl font-bold text-white">Competitive Tournaments</h3>
                  <p className="text-gray-400">Weekly championships with prizes</p>
                </div>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center gap-3">
                  <Award className="h-5 w-5" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Global leaderboards and rankings
                </li>
                <li className="flex items-center gap-3">
                  <Star className="h-5 w-5" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Achievement system and badges
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
                  Performance analytics and insights
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-6 mb-8">
                <Globe className="h-16 w-16" style={{ color: UI_CONFIG.SECONDARY_COLOR }} />
                <div>
                  <h3 className="text-2xl font-bold text-white">Global Community</h3>
                  <p className="text-gray-400">Connect with debaters worldwide</p>
                </div>
              </div>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center gap-3">
                  <Users className="h-5 w-5" style={{ color: UI_CONFIG.SECONDARY_COLOR }} />
                  Public and private debate rooms
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5" style={{ color: UI_CONFIG.SECONDARY_COLOR }} />
                  Real-time chat and reactions
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5" style={{ color: UI_CONFIG.SECONDARY_COLOR }} />
                  Moderated and safe environment
                </li>
              </ul>
            </Card>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
