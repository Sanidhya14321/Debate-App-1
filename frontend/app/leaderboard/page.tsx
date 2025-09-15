"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Medal, TrendingUp, Award, Crown} from "lucide-react";
import { api } from "../../lib/api";

interface LeaderboardUser {
  id: string
  username: string
  color: string
  rank: number
  score: number
  winRate: number
  totalDebates: number
  wins: number
  streak: number
}

export default function LeaderboardPage() {
  const [globalLeaders, setGlobalLeaders] = useState<LeaderboardUser[]>([])
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.get("/leaderboard");
        setGlobalLeaders(data);
        // For now, we'll use the same data for weekly leaders.
        // A separate endpoint could be created for this in the future.
        setWeeklyLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-[#ff6b35]" />
      case 2: return <Medal className="h-6 w-6 text-[#00ff88]" />
      case 3: return <Award className="h-6 w-6 text-[#ff0080]" />
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "default"
    if (rank <= 10) return "secondary"
    return "outline"
  }

  const LeaderboardTable = ({ users }: { users: LeaderboardUser[] }) => (
    <div className="space-y-4">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 hover:border-[#ff6b35]/50 transition-all duration-300 bg-card/50 backdrop-blur-sm ${user.rank <= 3 ? 'border-[#ff6b35]/50 bg-[#ff6b35]/10' : 'border-border/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>

                <Avatar className="h-12 w-12 border border-[#ff6b35]/30">
                  <AvatarFallback style={{ backgroundColor: user.color }} className="text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-white">{user.username}</h3>
                    <Badge 
                      variant={getRankBadge(user.rank)}
                      className={user.rank <= 3 ? "bg-[#ff6b35]/20 text-[#ff6b35] border-[#ff6b35]/50" : ""}
                    >
                      Rank #{user.rank}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{user.totalDebates} debates</span>
                    <span>{user.wins} wins</span>
                    <span>{user.winRate}% win rate</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-[#ff6b35]">{user.score || 0}</div>
                <div className="text-sm text-muted-foreground">points</div>
                {user.streak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-[#00ff88]" />
                    <span className="text-xs text-[#00ff88]">{user.streak} streak</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Removed animated background elements for cleaner look */}

      <motion.div className="relative container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/30 border border-zinc-800/30 mb-6">
              <Trophy className="h-4 w-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-white">Hall of Fame</span>
              <Crown className="h-4 w-4 text-[#00ff88]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              LEADERBOARD
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elite debaters ranked by <span className="text-[#ff6b35] font-semibold">performance</span> and <span className="text-[#00ff88] font-semibold">achievements</span>
            </p>
          </div>
          <p className="text-muted-foreground text-lg">
            See how you rank against other debaters
          </p>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[150px] mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Active Debaters */}
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center bg-card/50 backdrop-blur-sm border-[#ff6b35]/30">
              <Users className="h-8 w-8 mx-auto mb-2 text-[#ff6b35]" />
              <div className="text-2xl font-bold text-white">{globalLeaders.length}</div>
              <div className="text-sm text-muted-foreground">Active Debaters</div>
            </Card>

            {/* Best Streak */}
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center bg-card/50 backdrop-blur-sm border-[#00ff88]/30">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#00ff88]" />
              <div className="text-2xl font-bold text-white">
                {globalLeaders.length > 0
                  ? Math.max(...globalLeaders.map((u) => u.streak))
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </Card>
            {/* Top Score (highlight, spans more space) */}
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center bg-zinc-900/30 border-zinc-800/50">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-[#ff6b35]" />
              <div className="text-3xl font-bold text-white">{globalLeaders[0]?.score || 0}</div>
              <div className="text-sm text-muted-foreground">Top Score</div>
            </Card>
            
          </motion.div>
        </motion.div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border-[#ff6b35]/30">
            <TabsTrigger value="global" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black text-white">Global Rankings</TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-black text-white">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card className="bg-card/50 backdrop-blur-sm border-[#ff6b35]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-[#ff6b35]" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable users={globalLeaders} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card className="bg-card/50 backdrop-blur-sm border-[#ff6b35]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-[#00ff88]" />
                  Weekly Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable users={weeklyLeaders} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
