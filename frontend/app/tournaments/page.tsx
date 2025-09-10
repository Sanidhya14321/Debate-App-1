"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Clock, Calendar, Star, Zap } from "lucide-react"

interface Tournament {
  id: string
  name: string
  description: string
  status: 'upcoming' | 'active' | 'completed'
  participants: number
  maxParticipants: number
  prize: string
  startDate: string
  endDate: string
  rounds: number
  currentRound: number
  entryFee?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock tournament data
    const mockTournaments: Tournament[] = [
      {
        id: "1",
        name: "AI Ethics Championship",
        description: "Debate the future of artificial intelligence and its ethical implications",
        status: "upcoming",
        participants: 24,
        maxParticipants: 32,
        prize: "🏆 $500 + Premium Badge",
        startDate: "2024-02-01",
        endDate: "2024-02-15",
        rounds: 5,
        currentRound: 0,
        entryFee: 10,
        difficulty: "advanced"
      },
      {
        id: "2",
        name: "Climate Change Debate Series",
        description: "Discuss solutions and policies for addressing climate change",
        status: "active",
        participants: 16,
        maxParticipants: 16,
        prize: "🌟 Recognition + Eco Badge",
        startDate: "2024-01-15",
        endDate: "2024-01-30",
        rounds: 4,
        currentRound: 2,
        difficulty: "intermediate"
      },
      {
        id: "3",
        name: "Beginner's Philosophy Cup",
        description: "Perfect for new debaters to explore philosophical questions",
        status: "upcoming",
        participants: 8,
        maxParticipants: 16,
        prize: "🎓 Learning Badge + Mentorship",
        startDate: "2024-02-05",
        endDate: "2024-02-12",
        rounds: 3,
        currentRound: 0,
        difficulty: "beginner"
      },
      {
        id: "4",
        name: "Tech Innovation Showdown",
        description: "Debate the impact of emerging technologies on society",
        status: "completed",
        participants: 32,
        maxParticipants: 32,
        prize: "💎 Diamond Badge + $300",
        startDate: "2024-01-01",
        endDate: "2024-01-14",
        rounds: 5,
        currentRound: 5,
        entryFee: 5,
        difficulty: "intermediate"
      }
    ]

    setTournaments(mockTournaments)
    setLoading(false)
  }, [])

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500'
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
    }
  }

  const getDifficultyColor = (difficulty: Tournament['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const activeTournaments = tournaments.filter(t => t.status === 'active')
  const completedTournaments = tournaments.filter(t => t.status === 'completed')

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Tournaments
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete in structured debates and climb the ranks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{activeTournaments.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{upcomingTournaments.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{tournaments.reduce((sum, t) => sum + t.participants, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{completedTournaments.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </Card>
        </div>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-green-500" />
              Active Tournaments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTournaments.map((tournament) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{tournament.name}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{tournament.description}</p>
                        </div>
                        <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                          {tournament.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Round Progress</span>
                          <span>{tournament.currentRound}/{tournament.rounds}</span>
                        </div>
                        <Progress value={(tournament.currentRound / tournament.rounds) * 100} />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.participants}/{tournament.maxParticipants}
                          </span>
                          <Badge className={getDifficultyColor(tournament.difficulty)}>
                            {tournament.difficulty}
                          </Badge>
                        </div>
                        <span className="font-medium">{tournament.prize}</span>
                      </div>

                      <Button className="w-full" variant="default">
                        View Tournament
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Tournaments */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-500" />
            Upcoming Tournaments
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{tournament.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{tournament.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(tournament.difficulty)}>
                        {tournament.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Starts
                        </span>
                        <span>{formatDate(tournament.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Participants
                        </span>
                        <span>{tournament.participants}/{tournament.maxParticipants}</span>
                      </div>
                      
                      {tournament.entryFee && (
                        <div className="flex items-center justify-between">
                          <span>Entry Fee</span>
                          <span>${tournament.entryFee}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between font-medium">
                        <span>Prize</span>
                        <span>{tournament.prize}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Registration</span>
                        <span>{tournament.participants}/{tournament.maxParticipants}</span>
                      </div>
                      <Progress value={(tournament.participants / tournament.maxParticipants) * 100} />
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    disabled={tournament.participants >= tournament.maxParticipants}
                  >
                    {tournament.participants >= tournament.maxParticipants ? 'Full' : 'Join Tournament'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Completed Tournaments */}
        {completedTournaments.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Completed Tournaments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedTournaments.map((tournament) => (
                <Card key={tournament.id} className="p-6 opacity-75">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{tournament.name}</h3>
                        <p className="text-muted-foreground text-sm">{tournament.description}</p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.participants} participants
                      </span>
                      <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Results
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  )
}
