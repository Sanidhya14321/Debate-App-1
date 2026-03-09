import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    socket.userColor = decoded.color;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
};

const canJoinDebate = async (debateId, userId) => {
  const membership = await prisma.debateParticipant.findUnique({
    where: { debateId_userId: { debateId, userId } }
  });
  return Boolean(membership);
};

export const setupSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("join-debate", async (debateId) => {
      try {
        const debate = await prisma.debate.findUnique({ where: { id: debateId } });
        if (!debate) return socket.emit("error", { message: "Debate not found" });

        const authorized = await canJoinDebate(debateId, socket.userId);
        if (!authorized) return socket.emit("error", { message: "Not authorized to join this debate" });

        socket.join(`debate-${debateId}`);
        socket.currentDebate = debateId;

        socket.to(`debate-${debateId}`).emit("user-joined", {
          userId: socket.userId,
          username: socket.username,
          color: socket.userColor
        });

        const [participants, argumentsList] = await Promise.all([
          prisma.debateParticipant.findMany({
            where: { debateId },
            include: { user: { select: { id: true, username: true, color: true } } }
          }),
          prisma.argument.findMany({
            where: { debateId },
            include: { user: { select: { id: true, username: true, color: true } } },
            orderBy: { createdAt: "asc" }
          })
        ]);

        socket.emit("debate-state", {
          participants: participants.map((p) => p.user),
          arguments: argumentsList
        });
      } catch {
        socket.emit("error", { message: "Failed to join debate" });
      }
    });

    socket.on("leave-debate", (debateId) => {
      socket.leave(`debate-${debateId}`);
      socket.to(`debate-${debateId}`).emit("user-left", {
        userId: socket.userId,
        username: socket.username
      });
      socket.currentDebate = null;
    });

    socket.on("new-argument", async ({ debateId, content }) => {
      try {
        const authorized = await canJoinDebate(debateId, socket.userId);
        if (!authorized) return socket.emit("error", { message: "Unauthorized" });

        socket.to(`debate-${debateId}`).emit("user-stopped-typing", {
          userId: socket.userId,
          username: socket.username
        });

        socket.to(`debate-${debateId}`).emit("argument-processing", {
          userId: socket.userId,
          username: socket.username,
          content: `${(content || "").substring(0, 100)}...`
        });
      } catch {
        socket.emit("error", { message: "Failed to process argument" });
      }
    });

    socket.on("typing", (debateId) => {
      socket.to(`debate-${debateId}`).emit("user-typing", {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on("stop-typing", (debateId) => {
      socket.to(`debate-${debateId}`).emit("user-stopped-typing", {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on("chat-message", async ({ debateId, message }) => {
      try {
        const authorized = await canJoinDebate(debateId, socket.userId);
        if (!authorized) return socket.emit("error", { message: "Unauthorized" });

        io.to(`debate-${debateId}`).emit("new-chat-message", {
          id: Date.now().toString(),
          userId: socket.userId,
          username: socket.username,
          color: socket.userColor,
          message: (message || "").trim(),
          timestamp: new Date()
        });
      } catch {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("request-finalization", (debateId) => {
      socket.to(`debate-${debateId}`).emit("finalization-requested", {
        requestedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("approve-finalization", (debateId) => {
      io.to(`debate-${debateId}`).emit("finalization-approved", {
        approvedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("reject-finalization", (debateId) => {
      io.to(`debate-${debateId}`).emit("finalization-rejected", {
        rejectedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("disconnect", () => {
      if (socket.currentDebate) {
        socket.to(`debate-${socket.currentDebate}`).emit("user-left", {
          userId: socket.userId,
          username: socket.username
        });
      }
    });
  });

  io.broadcastToDebate = (debateId, event, data) => {
    io.to(`debate-${debateId}`).emit(event, data);
  };

  io.broadcastArgumentAdded = (debateId, argument) => {
    io.to(`debate-${debateId}`).emit("argument-added", argument);
  };

  io.broadcastDebateFinalized = (debateId, results) => {
    io.to(`debate-${debateId}`).emit("debate-finalized", results);
  };
};
