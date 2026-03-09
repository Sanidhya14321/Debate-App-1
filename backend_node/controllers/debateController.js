import dotenv from "dotenv";
import debateAnalysisService from "../services/debateAnalysisService.js";
import { prisma } from "../lib/prisma.js";

dotenv.config();

export const healthCheck = async (req, res) => {
  res.status(200).json({ status: "OK", message: "Debate service is running" });
};

const withParticipants = {
  participants: {
    include: {
      user: {
        select: { id: true, username: true, color: true }
      }
    }
  }
};

const toDebateResponse = (debate) => ({
  id: debate.id,
  _id: debate.id,
  topic: debate.topic,
  description: debate.description,
  isPrivate: debate.isPrivate,
  inviteCode: debate.inviteCode,
  status: debate.status,
  maxUsers: debate.maxUsers,
  startedAt: debate.startedAt,
  finalizedAt: debate.finalizedAt,
  result: debate.result,
  createdAt: debate.createdAt,
  joinedUsers: (debate.participants || []).map((p) => p.user)
});

export const createPrivateDebate = async (req, res) => {
  const { topic, description } = req.body;
  if (!topic) return res.status(400).json({ message: "Topic required" });

  try {
    let finalDescription = description;
    if (!description) {
      try {
        finalDescription = await debateAnalysisService.generateDebateDescription(topic);
      } catch {
        finalDescription = `Join the private debate about ${topic} and share your perspective.`;
      }
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const debate = await prisma.debate.create({
      data: {
        topic,
        description: finalDescription,
        isPrivate: true,
        inviteCode,
        participants: {
          create: { userId: req.user.id }
        }
      },
      include: withParticipants
    });

    res.status(201).json({ id: debate.id, _id: debate.id, inviteCode });
  } catch (err) {
    console.error("[create private debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
};

export const joinPrivateDebate = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const debate = await prisma.debate.findUnique({
      where: { inviteCode },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Invalid invite code" });

    const alreadyJoined = debate.participants.some((p) => p.userId === req.user.id);
    if (alreadyJoined) return res.status(400).json({ error: "You already joined this debate" });

    if (debate.participants.length >= debate.maxUsers) {
      return res.status(400).json({ error: "Debate is full" });
    }

    await prisma.debateParticipant.create({ data: { debateId: debate.id, userId: req.user.id } });

    const participantCount = debate.participants.length + 1;
    if (participantCount >= debate.maxUsers) {
      await prisma.debate.update({
        where: { id: debate.id },
        data: { status: "active", startedAt: new Date() }
      });
    }

    res.json({ id: debate.id, _id: debate.id, message: "Successfully joined debate" });
  } catch (err) {
    console.error("[join private debate]", err.message);
    res.status(500).json({ message: "Failed to join debate" });
  }
};

export const createDebate = async (req, res) => {
  try {
    const { topic, description, isPrivate = false } = req.body;
    let finalDescription = description;

    if (!description) {
      try {
        finalDescription = await debateAnalysisService.generateDebateDescription(topic);
      } catch {
        finalDescription = `Join the debate about ${topic} and share your perspective.`;
      }
    }

    const debate = await prisma.debate.create({
      data: {
        topic,
        description: finalDescription,
        isPrivate,
        participants: {
          create: { userId: req.user.id }
        }
      },
      include: withParticipants
    });

    res.status(201).json(toDebateResponse(debate));
  } catch (err) {
    console.error("[create debate]", err.message);
    res.status(500).json({ message: "Failed to create debate" });
  }
};

export const joinDebate = async (req, res) => {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });

    if (debate.participants.some((p) => p.userId === req.user.id)) {
      return res.status(400).json({ error: "Already joined" });
    }

    if (debate.participants.length >= debate.maxUsers) {
      return res.status(400).json({ error: "Debate is full" });
    }

    await prisma.debateParticipant.create({ data: { debateId: debate.id, userId: req.user.id } });

    const participantCount = debate.participants.length + 1;
    const updated = await prisma.debate.update({
      where: { id: debate.id },
      data: participantCount >= debate.maxUsers ? { status: "active", startedAt: new Date() } : {},
      include: withParticipants
    });

    res.json(toDebateResponse(updated));
  } catch (err) {
    console.error("[join debate]", err.message);
    res.status(500).json({ message: "Failed to join debate" });
  }
};

export const getDebateStatus = async (req, res) => {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });

    const totalArguments = await prisma.argument.count({ where: { debateId: debate.id } });
    const participants = debate.participants.map((p) => p.user.username);

    res.json({
      id: debate.id,
      _id: debate.id,
      topic: debate.topic,
      status: debate.status,
      isFinalized: debate.status === "completed",
      participants,
      totalArguments,
      result: debate.result,
      createdAt: debate.createdAt,
      maxUsers: debate.maxUsers
    });
  } catch (err) {
    console.error("[get debate status]", err.message);
    res.status(500).json({ message: "Failed to fetch debate status" });
  }
};

export const getOpenDebates = async (req, res) => {
  try {
    const debates = await prisma.debate.findMany({
      where: { status: "waiting", isPrivate: false },
      orderBy: { createdAt: "desc" },
      include: withParticipants
    });

    res.json(debates.map(toDebateResponse));
  } catch (err) {
    console.error("[get open debates]", err.message);
    res.status(500).json({ message: "Failed to fetch open debates" });
  }
};

export const addArgument = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "Argument must be at least 10 characters long" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: "Argument too long (max 2000 characters)" });
    }

    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });
    if (debate.status === "completed") {
      return res.status(400).json({ error: "Debate is completed. View results instead." });
    }

    const isParticipant = debate.participants.some((p) => p.userId === req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    const argument = await prisma.argument.create({
      data: {
        debateId: debate.id,
        userId: req.user.id,
        content: content.trim(),
        score: null
      },
      include: { user: { select: { username: true, color: true } } }
    });

    const argumentData = {
      id: argument.id,
      _id: argument.id,
      content: argument.content,
      score: argument.score,
      username: argument.user?.username || "Unknown",
      color: argument.user?.color || "#333",
      createdAt: argument.createdAt
    };

    const io = req.app.get("io");
    if (io) {
      io.to(`debate-${req.params.id}`).emit("argument-added", argumentData);
    }

    res.status(201).json(argumentData);
  } catch (err) {
    console.error("[add argument]", err.message);
    res.status(500).json({ message: "Failed to add argument" });
  }
};

export const getArguments = async (req, res) => {
  try {
    const debate = await prisma.debate.findUnique({ where: { id: req.params.id } });
    if (!debate) return res.status(404).json({ error: "Debate not found" });

    const argumentsList = await prisma.argument.findMany({
      where: { debateId: req.params.id },
      include: { user: { select: { username: true, color: true } } },
      orderBy: { createdAt: "asc" }
    });

    res.json(
      argumentsList.map((a) => ({
        id: a.id,
        _id: a.id,
        content: a.content,
        score: a.score,
        username: a.user?.username || "Unknown",
        color: a.user?.color || "#333",
        createdAt: a.createdAt
      }))
    );
  } catch (err) {
    console.error("[get arguments]", err.message);
    res.status(500).json({ message: "Failed to fetch arguments" });
  }
};

export const getDebateRoomData = async (req, res) => {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: req.params.id },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });

    const argumentsList = await prisma.argument.findMany({
      where: { debateId: req.params.id },
      include: { user: { select: { username: true, color: true, email: true } } },
      orderBy: { createdAt: "asc" }
    });

    const participants = debate.participants.map((p) => p.user.username);

    res.json({
      debate: {
        id: debate.id,
        _id: debate.id,
        topic: debate.topic,
        status: debate.status,
        isFinalized: debate.status === "completed",
        participants,
        totalArguments: argumentsList.length,
        result: debate.result,
        createdAt: debate.createdAt,
        maxUsers: debate.maxUsers
      },
      arguments: argumentsList.map((a) => ({
        id: a.id,
        _id: a.id,
        content: a.content,
        username: a.user?.username || "Unknown",
        email: a.user?.email || "",
        color: a.user?.color || "#333",
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    console.error("[get debate room data]", err.message);
    res.status(500).json({ message: "Failed to fetch debate room data" });
  }
};

const saveResult = async (debateId, analysisResult, analysisSource) => {
  const totals = Object.fromEntries(
    Object.entries(analysisResult.results).map(([username, data]) => [username, data.total])
  );

  return prisma.result.upsert({
    where: { debateId },
    update: {
      winner: analysisResult.winner,
      results: analysisResult.results,
      analysisSource,
      finalizedAt: new Date(),
      scores: analysisResult.results,
      totals
    },
    create: {
      debateId,
      winner: analysisResult.winner,
      results: analysisResult.results,
      analysisSource,
      finalizedAt: new Date(),
      scores: analysisResult.results,
      totals
    }
  });
};

const storeResultsInProfiles = async (debate, participants, analysisResult) => {
  for (const participant of participants) {
    const userId = participant.user.id;
    const username = participant.user.username;
    const opponent = participants.find((p) => p.user.id !== userId);

    const userScore = analysisResult.results[username]?.total || 0;
    const isWinner = analysisResult.winner === username;
    let result = isWinner ? "won" : "lost";

    const scores = Object.values(analysisResult.results).map((r) => r.total);
    if (Math.max(...scores) - Math.min(...scores) <= 5) {
      result = "draw";
    }

    await prisma.recentDebate.create({
      data: {
        userId,
        debateId: debate.id,
        topic: debate.topic,
        result,
        score: userScore,
        participatedAt: new Date(),
        opponent: opponent?.user.username || "Unknown",
        analysisSource: analysisResult.analysisSource || "langchain_groq"
      }
    });

    const incrementField = result === "won" ? "wins" : result === "lost" ? "losses" : "draws";
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalDebates: { increment: 1 },
        [incrementField]: { increment: 1 }
      }
    });

    const recent = await prisma.recentDebate.findMany({ where: { userId }, orderBy: { participatedAt: "desc" }, take: 10 });
    const averageScore = recent.length ? recent.reduce((sum, d) => sum + d.score, 0) / recent.length : 0;
    await prisma.user.update({ where: { id: userId }, data: { averageScore } });
  }
};

export const finalizeDebate = async (req, res) => {
  try {
    const debateId = req.params.id;
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        ...withParticipants,
        arguments: {
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });
    if (!debate.arguments.length) return res.status(400).json({ error: "No arguments to finalize" });
    if (debate.status === "completed") return res.status(400).json({ error: "Debate is already finalized" });

    if (!debate.participants.some((p) => p.userId === req.user.id)) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    const { forceFinalize } = req.body;
    if (!forceFinalize && debate.participants.length > 1) {
      return res.status(400).json({
        error: "Multiple participants detected. Both users must approve finalization.",
        requiresApproval: true
      });
    }

    const argumentsForAnalysis = debate.arguments.map((arg) => ({
      username: arg.user?.username || "Anonymous",
      content: arg.content || "",
      timestamp: arg.createdAt || new Date(),
      userId: arg.user?.id || null
    }));

    const analysisResult = await debateAnalysisService.analyzeDebateForBackend(argumentsForAnalysis, debate.topic);

    await saveResult(debate.id, analysisResult, analysisResult.analysisSource);

    await prisma.debate.update({
      where: { id: debate.id },
      data: {
        status: "completed",
        finalizedAt: new Date(),
        result: analysisResult
      }
    });

    await storeResultsInProfiles(debate, debate.participants, analysisResult);

    await prisma.finalizationRequest.deleteMany({ where: { debateId: debate.id } });

    const io = req.app.get("io");
    if (io) {
      io.to(`debate-${debateId}`).emit("debate-finalized", {
        debateId,
        results: analysisResult,
        analysisSource: analysisResult.analysisSource,
        winner: analysisResult.winner,
        finalizedAt: new Date().toISOString()
      });
    }

    res.json({
      message: "Debate finalized successfully",
      results: analysisResult,
      analysisSource: analysisResult.analysisSource,
      winner: analysisResult.winner,
      finalizedAt: new Date()
    });
  } catch (error) {
    console.error("Debate finalization failed:", error);
    res.status(500).json({ error: "Failed to finalize debate", details: error.message });
  }
};

export const requestFinalization = async (req, res) => {
  try {
    const debateId = req.params.id;
    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: withParticipants
    });

    if (!debate) return res.status(404).json({ error: "Debate not found" });

    if (!debate.participants.some((p) => p.userId === req.user.id)) {
      return res.status(403).json({ error: "You are not a participant in this debate" });
    }

    if (debate.status === "completed") {
      return res.status(400).json({ error: "Debate is already finalized" });
    }

    const existing = await prisma.finalizationRequest.findUnique({
      where: { debateId_userId: { debateId, userId: req.user.id } }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already requested finalization" });
    }

    await prisma.finalizationRequest.create({
      data: {
        debateId,
        userId: req.user.id,
        username: req.user.username
      }
    });

    const allRequests = await prisma.finalizationRequest.findMany({ where: { debateId } });

    const io = req.app.get("io");
    if (io) {
      io.to(`debate-${debateId}`).emit("finalization-requested", {
        requestedBy: req.user.username,
        userId: req.user.id,
        timestamp: new Date().toISOString(),
        totalRequests: allRequests.length,
        requiredApprovals: debate.participants.length
      });
    }

    if (allRequests.length >= debate.participants.length) {
      req.body.forceFinalize = true;
      return finalizeDebate(req, res);
    }

    res.json({
      message: "Finalization requested successfully",
      pendingApprovals: debate.participants.length - allRequests.length,
      requestedBy: allRequests.map((r) => r.username)
    });
  } catch (error) {
    console.error("Request finalization failed:", error);
    res.status(500).json({ error: "Failed to request finalization", details: error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const debateId = req.params.id;
    const result = await prisma.result.findUnique({ where: { debateId } });

    if (result) {
      const debate = await prisma.debate.findUnique({
        where: { id: debateId },
        include: withParticipants
      });

      return res.json({
        debateId,
        topic: debate?.topic || "",
        participants: debate?.participants?.map((p) => p.user.username) || [],
        totalArguments: await prisma.argument.count({ where: { debateId } }),
        winner: result.winner,
        results: result.results,
        analysisSource: result.analysisSource,
        finalizedAt: result.finalizedAt
      });
    }

    const debate = await prisma.debate.findUnique({ where: { id: debateId } });
    if (debate?.result) {
      const participants = await prisma.debateParticipant.findMany({
        where: { debateId },
        include: { user: { select: { username: true } } }
      });

      return res.json({
        debateId,
        topic: debate.topic,
        participants: participants.map((p) => p.user.username),
        totalArguments: await prisma.argument.count({ where: { debateId } }),
        winner: debate.result.winner,
        results: debate.result.results,
        analysisSource: debate.result.analysisSource || "unknown",
        finalizedAt: debate.finalizedAt || debate.updatedAt
      });
    }

    return res.status(404).json({ error: "Results not found. Debate may not be finalized yet." });
  } catch (err) {
    console.error("[get results]", err.message);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};
