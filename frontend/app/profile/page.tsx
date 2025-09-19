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
import { 
  ProfileHeaderSkeleton, 
  StatsGridSkeleton, 
  DebateListSkeleton, 
  PerformanceMetricsSkeleton,
  AnalyticsCardSkeleton
} from "@/components/ui/skeleton-components";
import { LazyLoad } from "@/components/ui/lazy-loading";

interface UserStats {
  totalDebates: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageScore: number;
  streak: number;
  rank: string;
  totalArguments: number;
}

interface RecentDebate {
  id: string;
  topic: string;
  result: 'won' | 'lost' | 'draw';
  score: number;
  date: string;
  opponent: string;
  analysisSource?: 'ml' | 'ai' | 'enhanced_local' | 'fallback';
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
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-16 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProfileHeaderSkeleton />
              <StatsGridSkeleton />
              
              <div className="space-y-6">
                <div className="grid w-full grid-cols-3 bg-black/30 backdrop-blur-sm border-white/20 rounded">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3">
                      <div className="h-8 w-full bg-white/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PerformanceMetricsSkeleton />
                  <AnalyticsCardSkeleton />
                </div>
              </div>
            </motion.div>
          </div>
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

  // Get analysis source color (matching results page)
  const getAnalysisSourceColor = (source: string): string => {
    switch (source) {
      case 'ml': return 'bg-purple-500';
      case 'ai': return 'bg-blue-500';
      case 'enhanced_local': return 'bg-green-500';
      case 'fallback': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Get analysis source label (matching results page)
  const getAnalysisSourceLabel = (source: string): string => {
    switch (source) {
      case 'ml': return 'ML Analysis';
      case 'ai': return 'AI Analysis';
      case 'enhanced_local': return 'Enhanced Local';
      case 'fallback': return 'Basic Analysis';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen">
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
                  value={stats?.averageScore || 0}
                  size={48}
                  strokeWidth={4}
                  color="#00ff88"
                  showValue={false}
                />
              </div>
              <div className="text-2xl font-bold text-white">{stats?.averageScore || 0}/100</div>
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
            <TabsList className="grid w-full grid-cols-3 bg-black/30 backdrop-blur-sm border-white/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">Overview</TabsTrigger>
              <TabsTrigger value="history" className="text-white data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">Recent Debates</TabsTrigger>
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <LazyLoad fallback={<PerformanceMetricsSkeleton />}>
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
                            value={stats?.averageScore || 0}
                            size={100}
                            strokeWidth={8}
                            color="#ff6b35"
                          />
                          <div className="mt-2 text-sm text-zinc-400">Avg Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-[#00ff88]">{stats?.wins || 0}</div>
                          <div className="text-xs text-zinc-400">Wins</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-[#ff4444]">{stats?.losses || 0}</div>
                          <div className="text-xs text-zinc-400">Losses</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-[#ffaa00]">{stats?.draws || 0}</div>
                          <div className="text-xs text-zinc-400">Draws</div>
                        </div>
                        <div className="bg-zinc-800/30 rounded-lg p-3">
                          <div className="text-xl font-bold text-[#ffd700]">{stats?.streak || 0}</div>
                          <div className="text-xs text-zinc-400">Streak</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LazyLoad>

                {/* User Info */}
                <LazyLoad fallback={<AnalyticsCardSkeleton />}>
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
                          <span className="text-zinc-400">Total Debates:</span>
                          <span className="text-white font-medium">{stats?.totalDebates || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Total Arguments:</span>
                          <span className="text-white font-medium">{stats?.totalArguments || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Win/Loss/Draw:</span>
                          <span className="text-white font-medium">
                            <span className="text-[#00ff88]">{stats?.wins || 0}</span>/
                            <span className="text-[#ff4444]">{stats?.losses || 0}</span>/
                            <span className="text-[#ffaa00]">{stats?.draws || 0}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Current Streak:</span>
                          <span className="text-[#ffd700] font-bold">{stats?.streak || 0} wins</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LazyLoad>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <LazyLoad fallback={<Card className="bg-zinc-900/30 border-zinc-800/50"><CardContent className="p-6"><DebateListSkeleton /></CardContent></Card>}>
                <Card className="bg-zinc-900/30 border-zinc-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Calendar className="h-5 w-5 text-[#ff6b35]" />
                      Recent Debates (Last 5)
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
                        {recentDebates.slice(0, 5).map((debate, index) => (
                          <motion.div 
                            key={debate.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-[#ff6b35]/30 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-2">{debate.topic}</h4>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-zinc-400">
                                  vs {debate.opponent} • {new Date(debate.date).toLocaleDateString()}
                                </p>
                                {debate.analysisSource && (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                    <div className={`w-2 h-2 rounded-full mr-1 ${getAnalysisSourceColor(debate.analysisSource)}`}></div>
                                    <span className="text-xs font-medium text-white">
                                      {getAnalysisSourceLabel(debate.analysisSource)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{debate.score || 0}/100</div>
                                <div className="text-xs text-zinc-400">Score</div>
                              </div>
                              <Badge 
                                variant={debate.result === 'won' ? 'default' : debate.result === 'lost' ? 'destructive' : 'secondary'}
                                className={
                                  debate.result === 'won' 
                                    ? 'bg-[#00ff88] text-black' 
                                    : debate.result === 'lost' 
                                    ? 'bg-[#ff4444] text-white' 
                                    : 'bg-[#ffaa00] text-black'
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
              </LazyLoad>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analysis Source Breakdown */}
                <LazyLoad fallback={<AnalyticsCardSkeleton />}>
                  <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <BarChart3 className="h-5 w-5 text-[#ff6b35]" />
                        Analysis Source Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                      {recentDebates.length > 0 ? (
                        (() => {
                          const sourceCounts = recentDebates.reduce((acc, debate) => {
                            const source = debate.analysisSource || 'unknown';
                            acc[source] = (acc[source] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return Object.entries(sourceCounts).map(([source, count]) => (
                            <div key={source} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${getAnalysisSourceColor(source)}`}></div>
                                  <span className="text-white/80">{getAnalysisSourceLabel(source)}</span>
                                </div>
                                <span className="text-white font-medium">{count} debates</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-1000 ${getAnalysisSourceColor(source)}`}
                                  style={{ width: `${(count / recentDebates.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ));
                        })()
                      ) : (
                        <p className="text-zinc-400 text-center py-4">No data available</p>
                      )}
                    </CardContent>
                  </Card>
                </LazyLoad>

                {/* Performance Trends */}
                <LazyLoad fallback={<AnalyticsCardSkeleton />}>
                  <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <TrendingUp className="h-5 w-5 text-[#ff6b35]" />
                        Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                      {recentDebates.length > 0 ? (
                        <>
                          <div className="bg-zinc-800/30 rounded-lg p-4">
                            <div className="text-lg font-bold text-white">
                              {Math.round(recentDebates.reduce((sum, d) => sum + d.score, 0) / recentDebates.length) || 0}
                            </div>
                            <div className="text-sm text-zinc-400">Average Score (Recent)</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-4">
                            <div className="text-lg font-bold text-white">
                              {Math.max(...recentDebates.map(d => d.score))}
                            </div>
                            <div className="text-sm text-zinc-400">Highest Score</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-4">
                            <div className="text-lg font-bold text-white">
                              {recentDebates.filter(d => d.result === 'won').length}
                            </div>
                            <div className="text-sm text-zinc-400">Recent Wins</div>
                          </div>
                          <div className="bg-zinc-800/30 rounded-lg p-4">
                            <div className="text-lg font-bold text-white">
                              {Math.round((recentDebates.filter(d => d.result === 'won').length / recentDebates.length) * 100) || 0}%
                            </div>
                            <div className="text-sm text-zinc-400">Recent Win Rate</div>
                          </div>
                        </>
                      ) : (
                        <p className="text-zinc-400 text-center py-4">No data available</p>
                      )}
                    </CardContent>
                  </Card>
                </LazyLoad>
              </div>

              {/* Debate Quality Analysis */}
              {recentDebates.length > 0 && (
                <LazyLoad fallback={<AnalyticsCardSkeleton />}>
                  <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Award className="h-5 w-5 text-[#ff6b35]" />
                        Debate Quality Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center bg-zinc-800/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-[#00ff88]">
                            {recentDebates.filter(d => d.score >= 80).length}
                          </div>
                          <div className="text-sm text-zinc-400">Excellent (80+)</div>
                        </div>
                        <div className="text-center bg-zinc-800/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-[#ffd700]">
                            {recentDebates.filter(d => d.score >= 60 && d.score < 80).length}
                          </div>
                          <div className="text-sm text-zinc-400">Good (60-79)</div>
                        </div>
                        <div className="text-center bg-zinc-800/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-[#ff6b35]">
                            {recentDebates.filter(d => d.score >= 40 && d.score < 60).length}
                          </div>
                          <div className="text-sm text-zinc-400">Fair (40-59)</div>
                        </div>
                        <div className="text-center bg-zinc-800/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-[#ff4444]">
                            {recentDebates.filter(d => d.score < 40).length}
                          </div>
                          <div className="text-sm text-zinc-400">Needs Work (&lt;40)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LazyLoad>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </ProtectedRoute>
    </div>
  );
}
