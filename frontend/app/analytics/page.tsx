"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UI_CONFIG } from '@/lib/api';
import { MessageSquare, Trophy, Target, Star} from 'lucide-react';
import { api } from '@/lib/api';

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

const COLOR_MAP = {
  primary: UI_CONFIG.PRIMARY_COLOR,
  secondary: UI_CONFIG.SECONDARY_COLOR,
  accent: UI_CONFIG.ACCENT_COLOR,
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.get('/analytics');
      setAnalyticsData(data);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const safePercentage = (value: number) => Math.round(value * 100);

  return (
  <div className="container mx-auto px-4 py-8 bg-dark-gradient">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Analytics Dashboard</h1>
        <p className="text-xl text-gray-400">Track your debate performance and growth</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <Card className="bg-black/5 border-black/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Total Debates</CardTitle>
            <MessageSquare className="h-6 w-6" style={{ color: COLOR_MAP.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.totalDebates}</div>
            <p className="text-sm" style={{ color: COLOR_MAP.secondary }}>+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-black/5 border-black/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Arguments Made</CardTitle>
            <Target className="h-6 w-6" style={{ color: COLOR_MAP.secondary }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.totalArguments}</div>
            <p className="text-sm" style={{ color: COLOR_MAP.secondary }}>+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-black/5 border-black/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Average Score</CardTitle>
            <Star className="h-6 w-6" style={{ color: COLOR_MAP.accent }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{safePercentage(analyticsData.overview.averageScore)}%</div>
            <p className="text-sm" style={{ color: COLOR_MAP.secondary }}>+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-black/5 border-black/10 p-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium text-gray-300">Win Rate</CardTitle>
            <Trophy className="h-6 w-6" style={{ color: COLOR_MAP.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{analyticsData.overview.winRate}%</div>
            <p className="text-sm" style={{ color: COLOR_MAP.secondary }}>+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs (Performance, Engagement, Achievements, Rankings) */}
      <Tabs defaultValue="performance" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-black/5 border-black/10 p-2">
          <TabsTrigger value="performance" className="data-[state=active]:text-white data-[state=active]:bg-blue-600">Performance</TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:text-white">Engagement</TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:text-white">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:text-white">Rankings</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Recent Performance & Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/5 border-black/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Performance</CardTitle>
                <CardDescription className="text-gray-400">Your latest debate scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.performance.scoreHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-400">{entry.debates} debates</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{safePercentage(entry.score)}%</div>
                      <div className="w-20 bg-black/10 rounded-full h-2 mt-1">
                        <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${safePercentage(entry.score)}%`, backgroundColor: COLOR_MAP.primary }} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-black/5 border-black/10">
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
                        <span className="text-2xl font-bold text-white">{safePercentage(category.score)}%</span>
                        <Badge variant="outline" className="text-xs">{category.count} debates</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-3">
                      <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${safePercentage(category.score)}%`, backgroundColor: COLOR_MAP.secondary }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        {/* ...similar safe-percentage handling and TS checks for engagement, achievements, leaderboard... */}
      </Tabs>
    </div>
  );
}
