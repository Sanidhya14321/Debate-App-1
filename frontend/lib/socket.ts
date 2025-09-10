// lib/socket.ts
// @ts-ignore - socket.io-client will be installed
import { io } from 'socket.io-client';

class SocketManager {
  private socket: any = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    this.socket.on('error', (error: any) => {
      console.error('🔌 Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Debate-specific methods
  joinDebate(debateId: string) {
    if (this.socket) {
      this.socket.emit('join-debate', debateId);
    }
  }

  leaveDebate(debateId: string) {
    if (this.socket) {
      this.socket.emit('leave-debate', debateId);
    }
  }

  sendArgument(debateId: string, content: string) {
    if (this.socket) {
      this.socket.emit('new-argument', { debateId, content });
    }
  }

  sendTyping(debateId: string) {
    if (this.socket) {
      this.socket.emit('typing', debateId);
    }
  }

  stopTyping(debateId: string) {
    if (this.socket) {
      this.socket.emit('stop-typing', debateId);
    }
  }

  sendChatMessage(debateId: string, message: string) {
    if (this.socket) {
      this.socket.emit('chat-message', { debateId, message });
    }
  }

  // Event listeners
  onDebateState(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('debate-state', callback);
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onArgumentAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('argument-added', callback);
    }
  }

  onArgumentProcessing(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('argument-processing', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-stopped-typing', callback);
    }
  }

  onChatMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-chat-message', callback);
    }
  }

  onDebateFinalized(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('debate-finalized', callback);
    }
  }

  onDebateStatusUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('debate-status-updated', callback);
    }
  }

  // Remove event listeners
  off(event: string, callback?: Function) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;
