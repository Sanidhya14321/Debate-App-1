// socket/socketHandlers.js
import jwt from 'jsonwebtoken';
import Debate from '../models/Debate.js';

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    socket.userColor = decoded.color;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

export const setupSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.username} connected`);
    
    // Join debate room
    socket.on('join-debate', async (debateId) => {
      try {
        const debate = await Debate.findById(debateId);
        if (!debate) {
          socket.emit('error', { message: 'Debate not found' });
          return;
        }
        
        // Check if user is participant
        if (!debate.joinedUsers.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized to join this debate' });
          return;
        }
        
        socket.join(`debate-${debateId}`);
        socket.currentDebate = debateId;
        
        // Notify other participants
        socket.to(`debate-${debateId}`).emit('user-joined', {
          userId: socket.userId,
          username: socket.username,
          color: socket.userColor
        });
        
        // Send current debate state
        const debateData = await Debate.findById(debateId)
          .populate('joinedUsers', 'username color')
          .populate('arguments.user', 'username color');
          
        socket.emit('debate-state', {
          debate: debateData,
          participants: debateData.joinedUsers,
          arguments: debateData.arguments
        });
        
        console.log(`👥 User ${socket.username} joined debate ${debateId}`);
      } catch (error) {
        console.error('Error joining debate:', error);
        socket.emit('error', { message: 'Failed to join debate' });
      }
    });
    
    // Leave debate room
    socket.on('leave-debate', (debateId) => {
      socket.leave(`debate-${debateId}`);
      socket.to(`debate-${debateId}`).emit('user-left', {
        userId: socket.userId,
        username: socket.username
      });
      socket.currentDebate = null;
      console.log(`👋 User ${socket.username} left debate ${debateId}`);
    });
    
    // Real-time argument submission
    socket.on('new-argument', async (data) => {
      const { debateId, content } = data;
      
      try {
        const debate = await Debate.findById(debateId);
        if (!debate || !debate.joinedUsers.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        // Broadcast typing stopped
        socket.to(`debate-${debateId}`).emit('user-stopped-typing', {
          userId: socket.userId,
          username: socket.username
        });
        
        // The actual argument will be added via the REST API
        // This just notifies other users that a new argument is being processed
        socket.to(`debate-${debateId}`).emit('argument-processing', {
          userId: socket.userId,
          username: socket.username,
          content: content.substring(0, 100) + '...'
        });
        
      } catch (error) {
        console.error('Error processing argument:', error);
        socket.emit('error', { message: 'Failed to process argument' });
      }
    });
    
    // Typing indicators
    socket.on('typing', (debateId) => {
      socket.to(`debate-${debateId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username
      });
    });
    
    socket.on('stop-typing', (debateId) => {
      socket.to(`debate-${debateId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        username: socket.username
      });
    });
    
    // Real-time chat messages
    socket.on('chat-message', async (data) => {
      const { debateId, message } = data;
      
      try {
        const debate = await Debate.findById(debateId);
        if (!debate || !debate.joinedUsers.includes(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        const chatMessage = {
          id: Date.now().toString(),
          userId: socket.userId,
          username: socket.username,
          color: socket.userColor,
          message: message.trim(),
          timestamp: new Date()
        };
        
        // Broadcast to all participants in the debate
        io.to(`debate-${debateId}`).emit('new-chat-message', chatMessage);
        
        console.log(`💬 Chat message in debate ${debateId}: ${socket.username}: ${message}`);
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Debate status updates
    socket.on('debate-status-change', (data) => {
      const { debateId, status } = data;
      socket.to(`debate-${debateId}`).emit('debate-status-updated', {
        status,
        updatedBy: socket.username
      });
    });
    
    // Finalization request handling
    socket.on('request-finalization', (debateId) => {
      console.log(`🏆 Finalization requested by ${socket.username} for debate ${debateId}`);
      socket.to(`debate-${debateId}`).emit('finalization-requested', {
        requestedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('approve-finalization', (debateId) => {
      console.log(`✅ Finalization approved by ${socket.username} for debate ${debateId}`);
      io.to(`debate-${debateId}`).emit('finalization-approved', {
        approvedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('reject-finalization', (debateId) => {
      console.log(`❌ Finalization rejected by ${socket.username} for debate ${debateId}`);
      io.to(`debate-${debateId}`).emit('finalization-rejected', {
        rejectedBy: socket.username,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.username} disconnected`);
      
      if (socket.currentDebate) {
        socket.to(`debate-${socket.currentDebate}`).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });
    
    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  // Broadcast functions for use in controllers
  io.broadcastToDebate = (debateId, event, data) => {
    io.to(`debate-${debateId}`).emit(event, data);
  };
  
  io.broadcastArgumentAdded = (debateId, argument) => {
    io.to(`debate-${debateId}`).emit('argument-added', argument);
  };
  
  io.broadcastDebateFinalized = (debateId, results) => {
    io.to(`debate-${debateId}`).emit('debate-finalized', results);
  };
};
