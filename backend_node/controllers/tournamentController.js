// controllers/tournamentController.js
import Tournament from "../models/Tournament.js";
import User from "../models/User.js";
import Debate from "../models/Debate.js";

// Get all tournaments with pagination and filtering
export const getTournaments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, difficulty } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;
    
    const tournaments = await Tournament.find(query)
      .populate('participants', 'username color')
      .populate('createdBy', 'username')
      .populate('winner', 'username color')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Tournament.countDocuments(query);
    
    res.json({
      tournaments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('[get tournaments]', error);
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
};

// Get tournament by ID
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants', 'username color')
      .populate('createdBy', 'username')
      .populate('winner', 'username color')
      .populate('runnerUp', 'username color')
      .populate('bracket.matches.participant1', 'username color')
      .populate('bracket.matches.participant2', 'username color')
      .populate('bracket.matches.winner', 'username color')
      .populate('bracket.matches.debate');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error) {
    console.error('[get tournament by id]', error);
    res.status(500).json({ message: 'Failed to fetch tournament' });
  }
};

// Create new tournament (Admin only)
export const createTournament = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only administrators can create tournaments' });
    }

    const {
      name,
      description,
      maxParticipants,
      prize,
      startDate,
      endDate,
      entryFee,
      difficulty,
      topics
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !maxParticipants || !prize || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate maxParticipants is power of 2 for bracket generation
    if ((maxParticipants & (maxParticipants - 1)) !== 0) {
      return res.status(400).json({ 
        message: 'Maximum participants must be a power of 2 (2, 4, 8, 16, 32, etc.)' 
      });
    }
    
    // Calculate number of rounds based on participants
    const rounds = Math.ceil(Math.log2(maxParticipants));
    
    const tournament = new Tournament({
      name,
      description,
      maxParticipants,
      prize,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rounds,
      entryFee: entryFee || 0,
      difficulty: difficulty || 'intermediate',
      topics: topics || [],
      createdBy: req.user.id
    });
    
    await tournament.save();
    
    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('createdBy', 'username')
      .populate('participants', 'username color');
    
    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: populatedTournament
    });
  } catch (error) {
    console.error('[create tournament]', error);
    res.status(500).json({ message: 'Failed to create tournament' });
  }
};

// Join tournament
export const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament is not open for registration' });
    }
    
    if (tournament.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this tournament' });
    }
    
    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    tournament.participants.push(req.user.id);
    await tournament.save();
    
    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('participants', 'username color');
    
    // If tournament is full, generate bracket
    if (tournament.participants.length === tournament.maxParticipants) {
      await generateTournamentBracket(tournament._id);
    }
    
    res.json({
      message: 'Successfully joined tournament',
      tournament: populatedTournament
    });
  } catch (error) {
    console.error('[join tournament]', error);
    res.status(500).json({ message: 'Failed to join tournament' });
  }
};

// Generate tournament bracket
const generateTournamentBracket = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId)
      .populate('participants', 'username');
    
    if (!tournament) return;
    
    // Shuffle participants for random seeding
    const participants = [...tournament.participants];
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    
    const bracket = [];
    let currentRoundParticipants = participants;
    
    for (let round = 1; round <= tournament.rounds; round++) {
      const matches = [];
      const nextRoundParticipants = [];
      
      for (let i = 0; i < currentRoundParticipants.length; i += 2) {
        if (i + 1 < currentRoundParticipants.length) {
          matches.push({
            participant1: currentRoundParticipants[i]._id,
            participant2: currentRoundParticipants[i + 1]._id,
            status: round === 1 ? 'pending' : 'pending'
          });
          // For now, we'll add placeholders for next round
          nextRoundParticipants.push(null);
        } else {
          // Bye - participant advances automatically
          nextRoundParticipants.push(currentRoundParticipants[i]._id);
        }
      }
      
      bracket.push({ round, matches });
      currentRoundParticipants = nextRoundParticipants;
    }
    
    tournament.bracket = bracket;
    tournament.status = 'active';
    await tournament.save();
    
    console.log(`🏆 Generated bracket for tournament ${tournament.name}`);
  } catch (error) {
    console.error('Error generating bracket:', error);
  }
};

// Get tournament bracket
export const getTournamentBracket = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('bracket.matches.participant1', 'username color')
      .populate('bracket.matches.participant2', 'username color')
      .populate('bracket.matches.winner', 'username color')
      .populate('bracket.matches.debate');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    res.json({
      bracket: tournament.bracket,
      currentRound: tournament.currentRound,
      totalRounds: tournament.rounds
    });
  } catch (error) {
    console.error('[get tournament bracket]', error);
    res.status(500).json({ message: 'Failed to fetch tournament bracket' });
  }
};

// Update tournament status
export const updateTournamentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Only admin can update tournament status
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only administrators can update tournament status' });
    }
    
    tournament.status = status;
    await tournament.save();
    
    res.json({ message: 'Tournament status updated', tournament });
  } catch (error) {
    console.error('[update tournament status]', error);
    res.status(500).json({ message: 'Failed to update tournament status' });
  }
};

// Update tournament details (Admin only)
export const updateTournament = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only administrators can update tournaments' });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Don't allow updates if tournament is active or completed
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ 
        message: 'Cannot update tournament that has already started or completed' 
      });
    }

    const {
      name,
      description,
      maxParticipants,
      prize,
      startDate,
      endDate,
      entryFee,
      difficulty,
      topics
    } = req.body;

    // Update fields if provided
    if (name) tournament.name = name;
    if (description) tournament.description = description;
    if (maxParticipants) {
      // Validate maxParticipants is power of 2
      if ((maxParticipants & (maxParticipants - 1)) !== 0) {
        return res.status(400).json({ 
          message: 'Maximum participants must be a power of 2 (2, 4, 8, 16, 32, etc.)' 
        });
      }
      tournament.maxParticipants = maxParticipants;
      tournament.rounds = Math.ceil(Math.log2(maxParticipants));
    }
    if (prize) tournament.prize = prize;
    if (startDate) tournament.startDate = new Date(startDate);
    if (endDate) tournament.endDate = new Date(endDate);
    if (entryFee !== undefined) tournament.entryFee = entryFee;
    if (difficulty) tournament.difficulty = difficulty;
    if (topics) tournament.topics = topics;

    await tournament.save();

    const populatedTournament = await Tournament.findById(tournament._id)
      .populate('createdBy', 'username')
      .populate('participants', 'username color');

    res.json({
      message: 'Tournament updated successfully',
      tournament: populatedTournament
    });
  } catch (error) {
    console.error('[update tournament]', error);
    res.status(500).json({ message: 'Failed to update tournament' });
  }
};

// Delete tournament (Admin only)
export const deleteTournament = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only administrators can delete tournaments' });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Don't allow deletion if tournament is active
    if (tournament.status === 'active') {
      return res.status(400).json({ 
        message: 'Cannot delete an active tournament' 
      });
    }

    await Tournament.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('[delete tournament]', error);
    res.status(500).json({ message: 'Failed to delete tournament' });
  }
};

// Force start tournament (Admin only)
export const forceStartTournament = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only administrators can force start tournaments' });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament is not in upcoming status' });
    }

    if (tournament.participants.length < 2) {
      return res.status(400).json({ message: 'Tournament needs at least 2 participants to start' });
    }

    // Generate bracket even if not full
    await generateTournamentBracket(tournament._id);

    res.json({ 
      message: 'Tournament started successfully',
      tournament: await Tournament.findById(tournament._id)
        .populate('participants', 'username color')
    });
  } catch (error) {
    console.error('[force start tournament]', error);
    res.status(500).json({ message: 'Failed to start tournament' });
  }
};

// Get admin tournament statistics
export const getAdminTournamentStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = await Promise.all([
      Tournament.countDocuments({ status: 'upcoming' }),
      Tournament.countDocuments({ status: 'active' }),
      Tournament.countDocuments({ status: 'completed' }),
      Tournament.countDocuments(),
      Tournament.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalParticipants: { $sum: { $size: '$participants' } } } }
      ])
    ]);

    const [upcoming, active, completed, total, participantData] = stats;
    const totalParticipants = participantData[0]?.totalParticipants || 0;

    res.json({
      tournaments: {
        upcoming,
        active,
        completed,
        total
      },
      totalParticipants,
      averageParticipants: completed > 0 ? Math.round(totalParticipants / completed) : 0
    });
  } catch (error) {
    console.error('[get admin tournament stats]', error);
    res.status(500).json({ message: 'Failed to fetch tournament statistics' });
  }
};

// Get tournament results
export const getTournamentResults = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('winner', 'username color')
      .populate('runnerUp', 'username color')
      .populate('participants', 'username color')
      .populate('bracket.matches.participant1', 'username color')
      .populate('bracket.matches.participant2', 'username color')
      .populate('bracket.matches.winner', 'username color');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status !== 'completed') {
      return res.status(400).json({ message: 'Tournament not yet completed' });
    }
    
    // Calculate participant statistics
    const participantStats = tournament.participants.map(participant => {
      const wins = tournament.bracket.reduce((total, round) => {
        return total + round.matches.filter(match => 
          match.winner && match.winner._id.toString() === participant._id.toString()
        ).length;
      }, 0);
      
      const totalMatches = tournament.bracket.reduce((total, round) => {
        return total + round.matches.filter(match => 
          (match.participant1 && match.participant1._id.toString() === participant._id.toString()) ||
          (match.participant2 && match.participant2._id.toString() === participant._id.toString())
        ).length;
      }, 0);
      
      return {
        participant,
        wins,
        losses: totalMatches - wins,
        winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
      };
    });
    
    // Sort by wins descending
    participantStats.sort((a, b) => b.wins - a.wins);
    
    res.json({
      tournament: {
        name: tournament.name,
        status: tournament.status,
        winner: tournament.winner,
        runnerUp: tournament.runnerUp,
        startDate: tournament.startDate,
        endDate: tournament.endDate
      },
      results: participantStats,
      bracket: tournament.bracket
    });
  } catch (error) {
    console.error('[get tournament results]', error);
    res.status(500).json({ message: 'Failed to fetch tournament results' });
  }
};
