"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Medal, Star, TrendingUp, Award, Crown, Zap } from "lucide-react";

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
    // Mock data - replace with actual API calls
    const mockData: LeaderboardUser[] = [
      { id: "1", username: "DebateMaster", color: "#ff6b6b", rank: 1, score: 2450, winRate: 87, totalDebates: 156, wins: 136, streak: 12 },
      { id: "2", username: "LogicLord", color: "#4ecdc4", rank: 2, score: 2380, winRate: 82, totalDebates: 142, wins: 116, streak: 8 },
      { id: "3", username: "ArgumentAce", color: "#45b7d1", rank: 3, score: 2290, winRate: 79, totalDebates: 128, wins: 101, streak: 5 },
      { id: "4", username: "ReasonRuler", color: "#96ceb4", rank: 4, score: 2180, winRate: 76, totalDebates: 118, wins: 90, streak: 3 },
      { id: "5", username: "PersuasionPro", color: "#feca57", rank: 5, score: 2120, winRate: 74, totalDebates: 105, wins: 78, streak: 7 },
      { id: "6", username: "DebateKing", color: "#ff9ff3", rank: 6, score: 2050, winRate: 71, totalDebates: 98, wins: 70, streak: 2 },
      { id: "7", username: "RhetoricalRex", color: "#54a0ff", rank: 7, score: 1980, winRate: 68, totalDebates: 89, wins: 61, streak: 4 },
      { id: "8", username: "ArgumentAngel", color: "#5f27cd", rank: 8, score: 1920, winRate: 65, totalDebates: 82, wins: 53, streak: 1 },
    ]

    setGlobalLeaders(mockData)
    setWeeklyLeaders([...mockData].sort(() => Math.random() - 0.5))
    setLoading(false)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Award className="h-6 w-6 text-amber-600" />
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
          <Card className={`p-4 ${user.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarFallback style={{ backgroundColor: user.color }} className="text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <Badge variant={getRankBadge(user.rank)}>
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
                <div className="text-2xl font-bold text-primary">{user.score}</div>
                <div className="text-sm text-muted-foreground">points</div>
                {user.streak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">{user.streak} streak</span>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#ff6b35]/20 to-[#00ff88]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#ff0080]/20 to-[#00d4ff]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div className="relative container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-[#00ff88]/20 border border-[#ff6b35]/30 mb-6">
              <Trophy className="h-4 w-4 text-[#ff6b35]" />
              <span className="text-sm font-medium text-white">Hall of Fame</span>
              <Crown className="h-4 w-4 text-[#00ff88]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-[#ff6b35] to-[#00ff88] bg-clip-text text-transparent mb-4">
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
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{globalLeaders.length}</div>
              <div className="text-sm text-muted-foreground">Active Debaters</div>
            </Card>

            {/* Best Streak */}
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {globalLeaders.length > 0
                  ? Math.max(...globalLeaders.map((u) => u.streak))
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </Card>
            {/* Top Score (highlight, spans more space) */}
            <Card className="p-6 text-center col-span-2 row-span-2 flex flex-col justify-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-3xl font-bold">{globalLeaders[0]?.score || 0}</div>
              <div className="text-sm text-muted-foreground">Top Score</div>
            </Card>
            
          </motion.div>
        </motion.div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global Rankings</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable users={globalLeaders} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
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
