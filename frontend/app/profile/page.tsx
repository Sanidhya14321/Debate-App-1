"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Target, MessageSquare, Calendar, TrendingUp, Award, Edit } from "lucide-react";

interface UserStats {
  totalDebates: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  streak: number;
  rank: string;
  totalArguments: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface RecentDebate {
  id: string;
  topic: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  date: string;
  opponent: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentDebates, setRecentDebates] = useState<RecentDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Mock data for now - replace with actual API calls
        setStats({
          totalDebates: 24,
          wins: 18,
          losses: 6,
          winRate: 75,
          averageScore: 8.2,
          streak: 5,
          rank: "Gold",
          totalArguments: 156
        });
        
        setAchievements([
          { id: "1", name: "First Victory", description: "Win your first debate", icon: "🏆", earned: true, earnedAt: "2024-01-15" },
          { id: "2", name: "Debate Master", description: "Win 10 debates", icon: "🎯", earned: true, earnedAt: "2024-02-20" },
          { id: "3", name: "Persuasion Expert", description: "Achieve 80% win rate", icon: "💡", earned: false },
          { id: "4", name: "Marathon Debater", description: "Participate in 50 debates", icon: "🏃", earned: false }
        ]);
        
        setRecentDebates([
          { id: "1", topic: "AI should replace human judges", result: "win", score: 8.5, date: "2024-01-20", opponent: "Alice" },
          { id: "2", topic: "Remote work is more productive", result: "win", score: 7.8, date: "2024-01-18", opponent: "Bob" },
          { id: "3", topic: "Social media benefits society", result: "loss", score: 6.2, date: "2024-01-15", opponent: "Charlie" }
        ]);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#ff6b35]/20 to-[#00ff88]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#ff0080]/20 to-[#00d4ff]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <ProtectedRoute>
        <div className="relative container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-8 bg-card/80 backdrop-blur-sm border-[#ff6b35]/30">
            <CardContent className="pt-8">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-[#00ff88]/20 border-2 border-[#ff6b35]/50 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback 
                      style={{ backgroundColor: user?.color || '#2563eb' }}
                      className="text-2xl font-bold text-white"
                    >
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#ff6b35] bg-clip-text text-transparent">{user?.username}</h1>
                  <p className="text-muted-foreground text-lg">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge className="bg-gradient-to-r from-[#ff6b35] to-[#ff6b35]/80 text-black font-semibold">
                      <Trophy className="w-4 h-4 mr-1" />
                      {stats?.rank} Rank
                    </Badge>
                    <Badge variant="outline" className="border-[#00ff88] text-[#00ff88]">
                      <Trophy className="w-4 h-4 mr-1" />
                      {stats?.wins} Wins
                    </Badge>
                    <Badge variant="outline" className="border-[#ff0080] text-[#ff0080]">
                      <Target className="w-4 h-4 mr-1" />
                      {stats?.winRate}% Win Rate
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35]/10">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#ff6b35]/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#ff6b35]" />
              <div className="text-2xl font-bold text-white">{stats?.totalDebates}</div>
              <div className="text-sm text-muted-foreground">Total Debates</div>
            </Card>
            
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#00ff88]/30">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-[#00ff88]" />
              <div className="text-2xl font-bold text-white">{stats?.averageScore}/10</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </Card>
            
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#ff0080]/30">
              <Target className="h-8 w-8 mx-auto mb-2 text-[#ff0080]" />
              <div className="text-2xl font-bold text-white">{stats?.totalArguments}</div>
              <div className="text-sm text-muted-foreground">Arguments Made</div>
            </Card>
            
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-[#00d4ff]/30">
              <Award className="h-8 w-8 mx-auto mb-2 text-[#00d4ff]" />
              <div className="text-2xl font-bold text-white">{achievements.filter(a => a.earned).length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Win Rate</span>
                        <span>{stats?.winRate}%</span>
                      </div>
                      <Progress value={stats?.winRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Score</span>
                        <span>{stats?.averageScore}/10</span>
                      </div>
                      <Progress value={(stats?.averageScore || 0) * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-3">
                    {recentDebates.slice(0, 3).map((debate) => (
                      <div key={debate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{debate.topic}</p>
                          <p className="text-xs text-muted-foreground">vs {debate.opponent}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={debate.result === 'win' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {debate.result}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{debate.score}/10</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`p-4 ${achievement.earned ? 'bg-primary/5 border-primary/20' : 'opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned && achievement.earnedAt && (
                          <p className="text-xs text-primary mt-1">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <Award className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debate History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDebates.map((debate) => (
                      <div key={debate.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium">{debate.topic}</h4>
                          <p className="text-sm text-muted-foreground">vs {debate.opponent} • {new Date(debate.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={debate.result === 'win' ? 'default' : debate.result === 'loss' ? 'destructive' : 'secondary'}
                          >
                            {debate.result}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Score: {debate.score}/10</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </ProtectedRoute>
    </div>
  );
}
