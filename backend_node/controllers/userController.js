import { prisma } from "../lib/prisma.js";

export const getProfile = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        recentDebates: {
          orderBy: { participatedAt: "desc" },
          take: 10
        }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const stats = {
      totalDebates: user.totalDebates,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      averageScore: user.averageScore
    };

    const winRate = stats.totalDebates > 0 ? Math.round((stats.wins / stats.totalDebates) * 100) : 0;
    const argumentCount = await prisma.argument.count({ where: { userId: user.id } });

    let currentStreak = 0;
    for (const debate of user.recentDebates) {
      if (debate.result === "won") currentStreak += 1;
      else break;
    }

    let rank = "Bronze";
    if (winRate >= 80 && stats.totalDebates >= 10) rank = "Diamond";
    else if (winRate >= 70 && stats.totalDebates >= 8) rank = "Platinum";
    else if (winRate >= 60 && stats.totalDebates >= 5) rank = "Gold";
    else if (winRate >= 50 && stats.totalDebates >= 3) rank = "Silver";

    const enhancedStats = {
      ...stats,
      winRate,
      streak: currentStreak,
      rank,
      totalArguments: argumentCount
    };

    const formattedDebates = user.recentDebates.slice(0, 5).map((debate) => ({
      id: debate.debateId,
      topic: debate.topic,
      result: debate.result,
      score: debate.score,
      date: debate.participatedAt,
      opponent: debate.opponent,
      analysisSource: debate.analysisSource
    }));

    res.json({
      username: user.username,
      email: user.email,
      color: user.color,
      stats: enhancedStats,
      recentDebates: formattedDebates
    });
  } catch (err) {
    console.error("[get profile]", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
