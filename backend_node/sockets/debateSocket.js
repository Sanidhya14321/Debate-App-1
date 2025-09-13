import jwt from "jsonwebtoken";

export function debateSocketHandler(io, socket) {
  console.log("⚡ User connected:", socket.id);

  // auth with JWT if token passed
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      socket.user = decoded;
      console.log("✅ Authenticated user:", decoded.username);
    } catch {
      console.warn("❌ Invalid token on socket connection");
    }
  }

  socket.on("joinRoom", (debateId) => {
    socket.join(`debate_${debateId}`);
    console.log(`📢 ${socket.id} joined room debate_${debateId}`);
    
    // Notify others in the room about the new user
    if (socket.user) {
      socket.to(`debate_${debateId}`).emit("userJoined", {
        username: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  socket.on("leaveRoom", (debateId) => {
    socket.leave(`debate_${debateId}`);
    console.log(`📢 ${socket.id} left room debate_${debateId}`);
    
    // Notify others in the room about the user leaving
    if (socket.user) {
      socket.to(`debate_${debateId}`).emit("userLeft", {
        username: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  // Handle typing indicators
  socket.on("typing", (debateId) => {
    if (socket.user) {
      socket.to(`debate_${debateId}`).emit("userTyping", {
        username: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  socket.on("stopTyping", (debateId) => {
    if (socket.user) {
      socket.to(`debate_${debateId}`).emit("userStoppedTyping", {
        username: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  // Handle finalization requests
  socket.on("requestFinalization", (debateId) => {
    if (socket.user) {
      console.log(`🏆 Finalization requested by ${socket.user.username} for debate ${debateId}`);
      socket.to(`debate_${debateId}`).emit("finalizationRequested", {
        requestedBy: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  socket.on("approveFinalization", (debateId) => {
    if (socket.user) {
      console.log(`✅ Finalization approved by ${socket.user.username} for debate ${debateId}`);
      io.to(`debate_${debateId}`).emit("finalizationApproved", {
        approvedBy: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  socket.on("rejectFinalization", (debateId) => {
    if (socket.user) {
      console.log(`❌ Finalization rejected by ${socket.user.username} for debate ${debateId}`);
      io.to(`debate_${debateId}`).emit("finalizationRejected", {
        rejectedBy: socket.user.username,
        userId: socket.user.id
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("⚡ User disconnected:", socket.id);
  });
}

// helper to emit from controllers
export function emitDebateEvent(io, debateId, event, payload) {
  io.to(`debate_${debateId}`).emit(event, payload);
}
