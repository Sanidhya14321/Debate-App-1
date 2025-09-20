"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trophy, Users, Clock, Calendar, Star, Zap, Plus, Crown, User } from "lucide-react"
import { 
  TournamentCardSkeleton, 
  StatsGridSkeleton, 
  PageHeaderSkeleton
} from "@/components/ui/skeleton-components"
import { LazyLoad } from "@/components/ui/lazy-loading"
import { useAuthGuard } from "@/lib/auth"
import { apiFetch } from "@/lib/apiFetch"
import { toast } from "sonner"

interface Tournament {
  _id: string
  name: string
  description: string
  status: 'upcoming' | 'active' | 'completed'
  participants: Array<{
    user: {
      _id: string
      username: string
      color: string
    }
    registeredAt: string
    eliminated: boolean
  }>
  maxParticipants: number
  prize: string
  startDate: string
  endDate: string
  rounds: number
  currentRound: number
  entryFee?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdBy: {
    _id: string
    username: string
  }
  createdByType: 'admin' | 'user'
  createdAt: string
}

export default function TournamentsPage() {
  useAuthGuard();
  
  const [adminTournaments, setAdminTournaments] = useState<Tournament[]>([]);
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    maxParticipants: '8',
    prize: '',
    startDate: '',
    endDate: '',
    entryFee: '0',
    difficulty: 'intermediate',
    topics: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // Fetch admin tournaments
      const adminResponse = await apiFetch('/tournaments?createdByType=admin');
      const adminData = await adminResponse.json();
      setAdminTournaments(adminData.tournaments || []);

      // Fetch user tournaments  
      const userResponse = await apiFetch('/tournaments?createdByType=user');
      const userData = await userResponse.json();
      setUserTournaments(userData.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournament.name.trim() || !newTournament.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setCreating(true);
    try {
      const tournamentData = {
        ...newTournament,
        maxParticipants: parseInt(newTournament.maxParticipants),
        entryFee: parseFloat(newTournament.entryFee),
        topics: newTournament.topics.split(',').map(t => t.trim()).filter(t => t)
      };

      const response = await apiFetch('/tournaments/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tournamentData)
      });

      if (response.ok) {
        toast.success('Tournament created successfully!');
        setShowCreateModal(false);
        setNewTournament({
          name: '',
          description: '',
          maxParticipants: '8',
          prize: '',
          startDate: '',
          endDate: '',
          entryFee: '0',
          difficulty: 'intermediate',
          topics: ''
        });
        fetchTournaments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create tournament');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      const response = await apiFetch(`/tournaments/${tournamentId}/join`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Successfully joined tournament!');
        fetchTournaments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to join tournament');
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast.error('Failed to join tournament');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeaderSkeleton />
        <StatsGridSkeleton />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const allTournaments = [...adminTournaments, ...userTournaments];
  const upcomingTournaments = allTournaments.filter(t => t.status === 'upcoming');
  const activeTournaments = allTournaments.filter(t => t.status === 'active');
  const completedTournaments = allTournaments.filter(t => t.status === 'completed');

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

        {/* Create Tournament Button */}
        <div className="flex justify-center">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tournament</DialogTitle>
                <DialogDescription>
                  Set up your own tournament and invite other debaters to participate.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tournament Name</Label>
                    <Input
                      id="name"
                      value={newTournament.name}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter tournament name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <select
                      id="maxParticipants"
                      value={newTournament.maxParticipants}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="4">4 Participants</option>
                      <option value="8">8 Participants</option>
                      <option value="16">16 Participants</option>
                      <option value="32">32 Participants</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTournament.description}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your tournament..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prize">Prize</Label>
                    <Input
                      id="prize"
                      value={newTournament.prize}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, prize: e.target.value }))}
                      placeholder="e.g., 🏆 Winner Badge"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={newTournament.difficulty}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newTournament.startDate}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newTournament.endDate}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee">Entry Fee</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newTournament.entryFee}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="topics">Topics (comma-separated)</Label>
                    <Input
                      id="topics"
                      value={newTournament.topics}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, topics: e.target.value }))}
                      placeholder="AI Ethics, Climate Change, Technology"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Tournament'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <LazyLoad fallback={<StatsGridSkeleton />}>
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
            <div className="text-2xl font-bold">{allTournaments.reduce((sum, t) => sum + t.participants.length, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </Card>
          
          <Card className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{completedTournaments.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </Card>
        </div>
        </LazyLoad>

        {/* Admin Tournaments */}
        {adminTournaments.length > 0 && (
          <LazyLoad fallback={<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <TournamentCardSkeleton key={i} />)}</div>}>
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Official Tournaments
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                  Admin
                </Badge>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {adminTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament._id} 
                    tournament={tournament} 
                    onJoin={handleJoinTournament}
                    isOfficial={true}
                  />
                ))}
              </div>
            </section>
          </LazyLoad>
        )}

        {/* User Tournaments */}
        {userTournaments.length > 0 && (
          <LazyLoad fallback={<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <TournamentCardSkeleton key={i} />)}</div>}>
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-500" />
                Community Tournaments
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                  User Created
                </Badge>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {userTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament._id} 
                    tournament={tournament} 
                    onJoin={handleJoinTournament}
                    isOfficial={false}
                  />
                ))}
              </div>
            </section>
          </LazyLoad>
        )}

        {/* Empty State */}
        {adminTournaments.length === 0 && userTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tournaments available</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a tournament!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Tournament
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Tournament Card Component
function TournamentCard({ 
  tournament, 
  onJoin, 
  isOfficial 
}: { 
  tournament: Tournament, 
  onJoin: (id: string) => void,
  isOfficial: boolean 
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: Tournament['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500'
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 h-full flex flex-col ${isOfficial ? 'border-yellow-200 bg-yellow-50/20' : 'border-blue-200 bg-blue-50/20'}`}>
        <div className="space-y-4 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{tournament.name}</h3>
                {isOfficial && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <p className="text-muted-foreground text-sm">{tournament.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Created by {tournament.createdBy.username}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${getStatusColor(tournament.status)} text-white text-xs`}>
                {tournament.status}
              </Badge>
              <Badge className={getDifficultyColor(tournament.difficulty)}>
                {tournament.difficulty}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {tournament.status === 'upcoming' ? 'Starts' : 'Started'}
              </span>
              <span>{formatDate(tournament.startDate)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Participants
              </span>
              <span>{tournament.participants.length}/{tournament.maxParticipants}</span>
            </div>
            
            {tournament.entryFee && tournament.entryFee > 0 && (
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

          {tournament.status === 'upcoming' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Registration</span>
                <span>{tournament.participants.length}/{tournament.maxParticipants}</span>
              </div>
              <Progress value={(tournament.participants.length / tournament.maxParticipants) * 100} />
            </div>
          )}

          {tournament.status === 'active' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Round Progress</span>
                <span>{tournament.currentRound}/{tournament.rounds}</span>
              </div>
              <Progress value={(tournament.currentRound / tournament.rounds) * 100} />
            </div>
          )}
        </div>

        <div className="mt-4">
          {tournament.status === 'upcoming' ? (
            <Button 
              className="w-full" 
              disabled={tournament.participants.length >= tournament.maxParticipants}
              onClick={() => onJoin(tournament._id)}
            >
              {tournament.participants.length >= tournament.maxParticipants ? 'Full' : 'Join Tournament'}
            </Button>
          ) : tournament.status === 'active' ? (
            <Button className="w-full" variant="outline">
              View Tournament
            </Button>
          ) : (
            <Button className="w-full" variant="outline">
              View Results
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
