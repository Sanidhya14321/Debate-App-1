import Debate from '../models/Debate.js';
import User from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  try {
    const debates = await Debate.find({ status: 'finished', result: { $exists: true } }).populate('joinedUsers', 'username color');

    const userStats = {};

    debates.forEach(debate => {
      if (debate.joinedUsers.length < 2 || !debate.result.winner) return;

      const winnerId = debate.result.winner === 'A' ? debate.joinedUsers[0]._id.toString() : debate.joinedUsers[1]._id.toString();

      debate.joinedUsers.forEach(user => {
        const userId = user._id.toString();
        if (!userStats[userId]) {
          userStats[userId] = {
            id: userId,
            username: user.username,
            color: user.color,
            totalDebates: 0,
            wins: 0,
            score: 0,
          };
        }

        userStats[userId].totalDebates++;
        if (userId === winnerId) {
          userStats[userId].wins++;
          userStats[userId].score += 10; // Add 10 points for a win
        } else {
          userStats[userId].score -= 5; // Subtract 5 points for a loss
        }
      });
    });

    const leaderboard = Object.values(userStats)
      .map(user => ({
        ...user,
        winRate: user.totalDebates > 0 ? Math.round((user.wins / user.totalDebates) * 100) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1, streak: 0 })); // Streak is not calculated yet

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
