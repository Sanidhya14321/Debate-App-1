'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Plus, 
  Eye, 
  Calendar,
  DollarSign,
  BarChart3,
  Trash2,
  Edit,
  Play,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../../lib/apiFetch';
import { 
  AnalyticsCardSkeleton, 
  StatsGridSkeleton, 
  DebateListSkeleton,
  TournamentCardSkeleton 
} from '../../../components/ui/skeleton-components';
import { LazyLoad } from '../../../components/ui/lazy-loading';

interface DashboardStats {
  userCount: number;
  debateCount: number;
  tournaments?: {
    upcoming: number;
    active: number;
    completed: number;
    total: number;
  };
  totalParticipants?: number;
  averageParticipants?: number;
}

interface Tournament {
  _id: string;
  name: string;
  description: string;
  maxParticipants: number;
  prize: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'upcoming' | 'active' | 'completed';
  participants: Array<{ _id: string; username: string; color: string }>;
  createdBy: { _id: string; username: string };
  topics?: string[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ userCount: 0, debateCount: 0 });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    maxParticipants: 8,
    prize: '',
    startDate: '',
    endDate: '',
    entryFee: 0,
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    topics: ['']
  });

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      
      if (!adminToken || !adminUser) {
        router.push('/admin/login');
        return;
      }
      
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      const statsResponse = await apiFetch('/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch tournament stats
      const tournamentStatsResponse = await apiFetch('/tournaments/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (tournamentStatsResponse.ok) {
        const tournamentStatsData = await tournamentStatsResponse.json();
        setStats(prev => ({ ...prev, ...tournamentStatsData }));
      }

      // Fetch tournaments
      const tournamentsResponse = await apiFetch('/tournaments?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (tournamentsResponse.ok) {
        const tournamentsData = await tournamentsResponse.json();
        setTournaments(tournamentsData.tournaments || []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tournamentData = {
        ...newTournament,
        topics: newTournament.topics.filter(topic => topic.trim() !== '')
      };

      const response = await apiFetch('/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(tournamentData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTournament({
          name: '',
          description: '',
          maxParticipants: 8,
          prize: '',
          startDate: '',
          endDate: '',
          entryFee: 0,
          difficulty: 'intermediate',
          topics: ['']
        });
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create tournament');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      setError('Failed to create tournament');
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    try {
      const response = await apiFetch(`/tournaments/${tournamentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete tournament');
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setError('Failed to delete tournament');
    }
  };

  const handleStartTournament = async (tournamentId: string) => {
    try {
      const response = await apiFetch(`/tournaments/${tournamentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to start tournament');
      }
    } catch (error) {
      console.error('Error starting tournament:', error);
      setError('Failed to start tournament');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return <div>Checking authentication...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline">Logout</Button>
        </div>
        
        <StatsGridSkeleton />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
        </div>
        
        <DebateListSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-5" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Manage tournaments, users, and platform statistics</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <LazyLoad fallback={<StatsGridSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Debates</p>
                  <p className="text-2xl font-bold text-white">{stats.debateCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Tournaments</p>
                  <p className="text-2xl font-bold text-white">{stats.tournaments?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <BarChart3 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tournament Participants</p>
                  <p className="text-2xl font-bold text-white">{stats.totalParticipants || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </LazyLoad>

        {/* Tournament Management */}
        <LazyLoad fallback={<AnalyticsCardSkeleton />}>
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Tournament Management</CardTitle>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tournament
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl backdrop-blur-xl bg-slate-900/95 border border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Tournament</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Set up a new tournament with custom settings and requirements.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateTournament} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Tournament Name</Label>
                        <Input
                          id="name"
                          value={newTournament.name}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="Enter tournament name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxParticipants" className="text-white">Max Participants</Label>
                        <select
                          id="maxParticipants"
                          value={newTournament.maxParticipants}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                          required
                        >
                          <option value={2}>2</option>
                          <option value={4}>4</option>
                          <option value={8}>8</option>
                          <option value={16}>16</option>
                          <option value={32}>32</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <textarea
                        id="description"
                        value={newTournament.description}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white resize-none"
                        rows={3}
                        placeholder="Describe the tournament..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="prize" className="text-white">Prize</Label>
                        <Input
                          id="prize"
                          value={newTournament.prize}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, prize: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="e.g., $500 or Premium Account"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="entryFee" className="text-white">Entry Fee ($)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          min="0"
                          value={newTournament.entryFee}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseFloat(e.target.value) }))}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                        <select
                          id="difficulty"
                          value={newTournament.difficulty}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                          required
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-white">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newTournament.startDate}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="endDate" className="text-white">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newTournament.endDate}
                          onChange={(e) => setNewTournament(prev => ({ ...prev, endDate: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateModal(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Create Tournament
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {tournaments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tournaments found. Create your first tournament!</p>
              ) : (
                tournaments.map((tournament) => (
                  <div key={tournament._id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                        <p className="text-gray-300 text-sm">{tournament.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${
                            tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                            tournament.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {tournament.status}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300">
                          {tournament.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div className="text-gray-400">
                        <Users className="h-4 w-4 inline mr-1" />
                        {tournament.participants.length}/{tournament.maxParticipants}
                      </div>
                      <div className="text-gray-400">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {tournament.prize}
                      </div>
                      <div className="text-gray-400">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-400">
                        Fee: ${tournament.entryFee}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {tournament.status === 'upcoming' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartTournament(tournament._id)}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {tournament.status === 'upcoming' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTournament(tournament._id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </LazyLoad>
      </div>
    </div>
  );
};

export default AdminDashboard;
