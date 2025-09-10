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
  });

  socket.on("leaveRoom", (debateId) => {
    socket.leave(`debate_${debateId}`);
    console.log(`📢 ${socket.id} left room debate_${debateId}`);
  });

  socket.on("disconnect", () => {
    console.log("⚡ User disconnected:", socket.id);
  });
}

// helper to emit from controllers
export function emitDebateEvent(io, debateId, event, payload) {
  io.to(`debate_${debateId}`).emit(event, payload);
}
