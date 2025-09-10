"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UI_CONFIG } from '@/lib/api';
import { TrendingUp, Users, MessageSquare, Trophy, Target, Brain, Clock, Star } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalDebates: number;
    totalArguments: number;
    averageScore: number;
    winRate: number;
  };
  performance: {
    scoreHistory: Array<{ date: string; score: number; debates: number }>;
    categoryBreakdown: Array<{ category: string; score: number; count: number }>;
  };
  engagement: {
    debatesPerWeek: Array<{ week: string; debates: number; arguments: number }>;
    peakHours: Array<{ hour: number; activity: number }>;
  };
  achievements: {
    recent: Array<{ name: string; icon: string; unlockedAt: string }>;
    progress: Array<{ name: string; current: number; target: number; category: string }>;
  };
  leaderboard: {
    global: Array<{ rank: number; username: string; score: number; debates: number }>;
    category: Array<{ category: string; rank: number; score: number }>;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        overview: {
          totalDebates: 47,
          totalArguments: 234,
          averageScore: 0.73,
          winRate: 64.2
        },
        performance: {
          scoreHistory: [
            { date: '2024-01-01', score: 0.65, debates: 3 },
            { date: '2024-01-08', score: 0.71, debates: 5 },
            { date: '2024-01-15', score: 0.68, debates: 4 },
            { date: '2024-01-22', score: 0.76, debates: 6 },
            { date: '2024-01-29', score: 0.73, debates: 4 },
          ],
          categoryBreakdown: [
            { category: 'Technology', score: 0.78, count: 12 },
            { category: 'Politics', score: 0.71, count: 15 },
            { category: 'Society', score: 0.69, count: 10 },
            { category: 'Ethics', score: 0.75, count: 8 },
            { category: 'Economics', score: 0.72, count: 2 },
          ]
        },
        engagement: {
          debatesPerWeek: [
            { week: 'Week 1', debates: 8, arguments: 42 },
            { week: 'Week 2', debates: 12, arguments: 58 },
            { week: 'Week 3', debates: 6, arguments: 31 },
            { week: 'Week 4', debates: 10, arguments: 48 },
          ],
          peakHours: [
            { hour: 9, activity: 15 },
            { hour: 12, activity: 28 },
            { hour: 15, activity: 22 },
            { hour: 18, activity: 35 },
            { hour: 21, activity: 40 },
          ]
        },
        achievements: {
          recent: [
            { name: 'Winning Streak', icon: '🔥', unlockedAt: '2024-01-28' },
            { name: 'High Scorer', icon: '⭐', unlockedAt: '2024-01-25' },
            { name: 'Debate Veteran', icon: '🏛️', unlockedAt: '2024-01-20' },
          ],
          progress: [
            { name: 'Master Debater', current: 47, target: 50, category: 'milestone' },
            { name: 'Tournament Champion', current: 0, target: 1, category: 'tournament' },
            { name: 'Unstoppable', current: 3, target: 5, category: 'skill' },
          ]
        },
        leaderboard: {
          global: [
            { rank: 12, username: 'You', score: 1247, debates: 47 },
            { rank: 11, username: 'DebateMaster', score: 1289, debates: 52 },
            { rank: 13, username: 'LogicLord', score: 1203, debates: 41 },
          ],
          category: [
            { category: 'Technology', rank: 8, score: 0.78 },
            { category: 'Politics', rank: 15, score: 0.71 },
            { category: 'Ethics', rank: 6, score: 0.75 },
          ]
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Analytics Dashboard</h1>
        <p className="text-xl text-gray-400">Track your debate performance and growth</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <Card className="bg-white/5 border-white/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Total Debates</CardTitle>
            <MessageSquare className="h-6 w-6" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.totalDebates}</div>
            <p className="text-sm" style={{ color: UI_CONFIG.SECONDARY_COLOR }}>+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Arguments Made</CardTitle>
            <Target className="h-6 w-6" style={{ color: UI_CONFIG.SECONDARY_COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.totalArguments}</div>
            <p className="text-sm" style={{ color: UI_CONFIG.SECONDARY_COLOR }}>+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Average Score</CardTitle>
            <Star className="h-6 w-6" style={{ color: UI_CONFIG.ACCENT_COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{Math.round(analyticsData.overview.averageScore * 100)}%</div>
            <p className="text-sm" style={{ color: UI_CONFIG.SECONDARY_COLOR }}>+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Win Rate</CardTitle>
            <Trophy className="h-6 w-6" style={{ color: UI_CONFIG.PRIMARY_COLOR }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.winRate}%</div>
            <p className="text-sm" style={{ color: UI_CONFIG.SECONDARY_COLOR }}>+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10 p-2">
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:text-white data-[state=active]:bg-blue-600"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="engagement"
            className="data-[state=active]:text-white"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="achievements"
            className="data-[state=active]:text-white"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard"
            className="data-[state=active]:text-white"
          >
            Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Performance</CardTitle>
                <CardDescription className="text-gray-400">Your latest debate scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.performance.scoreHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-400">{entry.debates} debates</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {Math.round(entry.score * 100)}%
                      </div>
                      <div className="w-20 bg-white/10 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${entry.score * 100}%`,
                            backgroundColor: UI_CONFIG.PRIMARY_COLOR 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Category Performance</CardTitle>
                <CardDescription className="text-gray-400">Your scores by debate category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.performance.categoryBreakdown.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {Math.round(category.score * 100)}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {category.count} debates
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${category.score * 100}%`,
                          backgroundColor: UI_CONFIG.SECONDARY_COLOR 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Weekly Activity</CardTitle>
                <CardDescription className="text-gray-400">Debates and arguments per week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.engagement.debatesPerWeek.map((week, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">{week.week}</span>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{week.debates}</div>
                          <div className="text-xs text-gray-400">debates</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{week.arguments}</div>
                          <div className="text-xs text-gray-400">arguments</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(week.debates / 15) * 100}%`,
                            backgroundColor: UI_CONFIG.PRIMARY_COLOR 
                          }}
                        />
                      </div>
                      <div className="bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(week.arguments / 60) * 100}%`,
                            backgroundColor: UI_CONFIG.SECONDARY_COLOR 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Peak Activity Hours</CardTitle>
                <CardDescription className="text-gray-400">When you're most active in debates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.engagement.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-medium">
                        {hour.hour}:00 - {hour.hour + 1}:00
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(hour.activity / 40) * 100}%`,
                            backgroundColor: UI_CONFIG.ACCENT_COLOR 
                          }}
                        />
                      </div>
                      <span className="text-white font-bold w-8 text-right">{hour.activity}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Achievements</CardTitle>
                <CardDescription className="text-gray-400">Your latest unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.achievements.recent.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Achievement Progress</CardTitle>
                <CardDescription className="text-gray-400">Progress towards next achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsData.achievements.progress.map((progress, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-white">{progress.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          {Math.round((progress.current / progress.target) * 100)}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {progress.current}/{progress.target}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(progress.current / progress.target) * 100}%`,
                          backgroundColor: UI_CONFIG.PRIMARY_COLOR 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Global Ranking</CardTitle>
                <CardDescription className="text-gray-400">Your position on the global leaderboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.leaderboard.global.map((entry, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg ${
                    entry.username === 'You' 
                      ? 'bg-white/10 border border-white/20' 
                      : 'bg-white/5'
                  }`}>
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
                      style={{ backgroundColor: UI_CONFIG.PRIMARY_COLOR }}
                    >
                      <span className="text-sm">#{entry.rank}</span>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback 
                        className="text-white text-sm font-bold"
                        style={{ backgroundColor: UI_CONFIG.SECONDARY_COLOR }}
                      >
                        {entry.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-lg">{entry.username}</h4>
                      <p className="text-sm text-gray-400">{entry.debates} debates</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-xl">{entry.score}</p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Category Rankings</CardTitle>
                <CardDescription className="text-gray-400">Your rank in different debate categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.leaderboard.category.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-lg">{entry.category}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">
                          {Math.round(entry.score * 100)}%
                        </span>
                        <div className="flex-1 bg-white/10 rounded-full h-2 max-w-24">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${entry.score * 100}%`,
                              backgroundColor: UI_CONFIG.ACCENT_COLOR 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-lg px-3 py-1 border-white/20 text-white"
                    >
                      #{entry.rank}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
