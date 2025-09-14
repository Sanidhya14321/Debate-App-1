import Debate from '../models/Debate.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDebates = await Debate.find({
      joinedUsers: userId,
      status: 'finished',
      result: { $exists: true },
    });

    let totalArguments = 0;
    let wins = 0;
    let totalScore = 0;
    let scoreCount = 0;

    userDebates.forEach(debate => {
      const userIsPlayerA = debate.joinedUsers[0].toString() === userId;
      const winner = debate.result.winner;

      if ((userIsPlayerA && winner === 'A') || (!userIsPlayerA && winner === 'B')) {
        wins++;
      }

      debate.arguments.forEach(arg => {
        if (arg.user.toString() === userId) {
          totalArguments++;
          if (arg.score && typeof arg.score === 'object' && typeof arg.score.final === 'number') {
            totalScore += arg.score.final;
            scoreCount++;
          } else if (arg.score && typeof arg.score.total === 'number') {
            // Handle different score structure
            totalScore += arg.score.total;
            scoreCount++;
          } else if (typeof arg.score === 'number') {
            // Handle direct numeric score
            totalScore += arg.score;
            scoreCount++;
          }
        }
      });
    });

    const totalDebates = userDebates.length;
    const winRate = totalDebates > 0 ? (wins / totalDebates) * 100 : 0;
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    const analyticsData = {
      overview: {
        totalDebates,
        totalArguments,
        averageScore,
        winRate,
      },
      // The rest of the analytics data will be implemented later.
      performance: { scoreHistory: [], categoryBreakdown: [] },
      engagement: { debatesPerWeek: [], peakHours: [] },
      achievements: { recent: [], progress: [] },
      leaderboard: { global: [], category: [] },
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
