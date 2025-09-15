"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Trophy, Target, MessageSquare, TrendingUp, Award, Edit, Calendar, User, BarChart3 } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "sonner";

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

interface RecentDebate {
  id: string;
  topic: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  date: string;
  opponent: string;
  finalizedAt?: string;
}

interface ProfileData {
  username: string;
  email: string;
  color: string;
  stats: UserStats;
  recentDebates: RecentDebate[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiFetch('/users') as ProfileData;
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff6b35]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = profileData?.stats;
  const recentDebates = profileData?.recentDebates || [];

  const getRankColor = (rank: string) => {
    switch(rank) {
      case 'Diamond': return '#b9f2ff';
      case 'Platinum': return '#e5e7eb';
      case 'Gold': return '#ffd700';
      case 'Silver': return '#c0c0c0';
      default: return '#cd7f32';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-8 bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/35 transition-all duration-300 hover:border-white/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-black/20 backdrop-blur-sm border-2 border-[#ff6b35]/50 flex items-center justify-center hover:border-[#ff6b35] transition-all duration-300">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback 
                      style={{ backgroundColor: profileData?.color || user?.color || '#ff6b35' }}
                      className="text-2xl font-bold text-white"
                    >
                      {profileData?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white">{profileData?.username || user?.username}</h1>
                  <p className="text-zinc-400 text-lg">{profileData?.email || user?.email}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge className="font-semibold text-black" style={{ backgroundColor: getRankColor(stats?.rank || 'Bronze') }}>
                      <Trophy className="w-4 h-4 mr-1" />
                      {stats?.rank} Rank
                    </Badge>
                    <Badge variant="outline" className="border-[#00ff88] text-[#00ff88]">
                      <Trophy className="w-4 h-4 mr-1" />
                      {stats?.wins || 0} Wins
                    </Badge>
                    <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35]">
                      <Target className="w-4 h-4 mr-1" />
                      {stats?.winRate || 0}% Win Rate
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
            <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/35 transition-all duration-300 hover:border-white/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#ff6b35]" />
              <div className="text-2xl font-bold text-white">{stats?.totalDebates || 0}</div>
              <div className="text-sm text-zinc-400">Total Debates</div>
            </Card>
            
            <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/35 transition-all duration-300 hover:border-white/30">
              <div className="flex justify-center mb-2">
                <CircularProgress
                  value={(stats?.averageScore || 0) * 10}
                  size={48}
                  strokeWidth={4}
                  color="#00ff88"
                  showValue={false}
                />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.averageScore || 0}/10</div>
              <div className="text-sm text-zinc-400">Average Score</div>
            </Card>
            
            <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/35 transition-all duration-300 hover:border-white/30">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-[#ff6b35]" />
              <div className="text-2xl font-bold text-white">{stats?.totalArguments || 0}</div>
              <div className="text-sm text-zinc-400">Arguments Made</div>
            </Card>
            
            <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/35 transition-all duration-300 hover:border-white/30">
              <Award className="h-8 w-8 mx-auto mb-2 text-[#ffd700]" />
              <div className="text-2xl font-bold text-white">{stats?.streak || 0}</div>
              <div className="text-sm text-zinc-400">Win Streak</div>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-sm border-white/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">Overview</TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">Recent Debates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="h-5 w-5 text-[#ff6b35]" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <CircularProgress
                          value={stats?.winRate || 0}
                          size={100}
                          strokeWidth={8}
                          color="#00ff88"
                        />
                        <div className="mt-2 text-sm text-zinc-400">Win Rate</div>
                      </div>
                      
                      <div className="text-center">
                        <CircularProgress
                          value={(stats?.averageScore || 0) * 10}
                          size={100}
                          strokeWidth={8}
                          color="#ff6b35"
                        />
                        <div className="mt-2 text-sm text-zinc-400">Avg Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-xl font-bold text-[#00ff88]">{stats?.wins || 0}</div>
                        <div className="text-xs text-zinc-400">Wins</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-xl font-bold text-[#ff4444]">{stats?.losses || 0}</div>
                        <div className="text-xs text-zinc-400">Losses</div>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-xl font-bold text-[#ffd700]">{stats?.streak || 0}</div>
                        <div className="text-xs text-zinc-400">Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Info */}
                <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <User className="h-5 w-5 text-[#ff6b35]" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Username:</span>
                        <span className="text-white font-medium">{profileData?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Email:</span>
                        <span className="text-white font-medium">{profileData?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Rank:</span>
                        <Badge style={{ backgroundColor: getRankColor(stats?.rank || 'Bronze') }} className="text-black font-medium">
                          {stats?.rank || 'Bronze'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Total Arguments:</span>
                        <span className="text-white font-medium">{stats?.totalArguments || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Current Streak:</span>
                        <span className="text-[#ffd700] font-bold">{stats?.streak || 0} wins</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-zinc-900/30 border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-[#ff6b35]" />
                    Last 5 Debates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDebates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                      <p className="text-zinc-400">No debates yet. Start your first debate!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDebates.map((debate, index) => (
                        <motion.div 
                          key={debate.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-[#ff6b35]/30 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">{debate.topic}</h4>
                            <p className="text-sm text-zinc-400">
                              vs {debate.opponent} • {new Date(debate.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{debate.score}/10</div>
                              <div className="text-xs text-zinc-400">Score</div>
                            </div>
                            <Badge 
                              variant={debate.result === 'win' ? 'default' : debate.result === 'loss' ? 'destructive' : 'secondary'}
                              className={
                                debate.result === 'win' 
                                  ? 'bg-[#00ff88] text-black' 
                                  : debate.result === 'loss' 
                                  ? 'bg-[#ff4444] text-white' 
                                  : 'bg-zinc-600 text-white'
                              }
                            >
                              {debate.result.toUpperCase()}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
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
