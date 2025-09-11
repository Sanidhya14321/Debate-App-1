// lib/socket.ts
import { io, Socket } from 'socket.io-client';

type DebateEventCallback<T = unknown> = (data: T) => void;

interface SocketAuth {
  token: string;
}

interface NewArgumentPayload {
  debateId: string;
  content: string;
}

interface ChatMessagePayload {
  debateId: string;
  message: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://debate-app-1.onrender.com', {
      auth: { token } as SocketAuth,
      autoConnect: true,
    });

    this.socket.on('connect', () => console.log('🔌 Connected to WebSocket server'));
    this.socket.on('disconnect', () => console.log('🔌 Disconnected from WebSocket server'));
    this.socket.on('error', (error: unknown) => console.error('🔌 Socket error:', error));

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Debate-specific methods
  joinDebate(debateId: string): void {
    this.socket?.emit('join-debate', debateId);
  }

  leaveDebate(debateId: string): void {
    this.socket?.emit('leave-debate', debateId);
  }

  sendArgument(debateId: string, content: string): void {
    const payload: NewArgumentPayload = { debateId, content };
    this.socket?.emit('new-argument', payload);
  }

  sendTyping(debateId: string): void {
    this.socket?.emit('typing', debateId);
  }

  stopTyping(debateId: string): void {
    this.socket?.emit('stop-typing', debateId);
  }

  sendChatMessage(debateId: string, message: string): void {
    const payload: ChatMessagePayload = { debateId, message };
    this.socket?.emit('chat-message', payload);
  }

  // Event listeners
  onDebateState(callback: DebateEventCallback): void {
    this.socket?.on('debate-state', callback);
  }

  onUserJoined(callback: DebateEventCallback): void {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: DebateEventCallback): void {
    this.socket?.on('user-left', callback);
  }

  onArgumentAdded(callback: DebateEventCallback): void {
    this.socket?.on('argument-added', callback);
  }

  onArgumentProcessing(callback: DebateEventCallback): void {
    this.socket?.on('argument-processing', callback);
  }

  onUserTyping(callback: DebateEventCallback): void {
    this.socket?.on('user-typing', callback);
  }

  onUserStoppedTyping(callback: DebateEventCallback): void {
    this.socket?.on('user-stopped-typing', callback);
  }

  onChatMessage(callback: DebateEventCallback): void {
    this.socket?.on('new-chat-message', callback);
  }

  onDebateFinalized(callback: DebateEventCallback): void {
    this.socket?.on('debate-finalized', callback);
  }

  onDebateStatusUpdated(callback: DebateEventCallback): void {
    this.socket?.on('debate-status-updated', callback);
  }

  // Remove event listeners
  off(event: string, callback?: DebateEventCallback): void {
    this.socket?.off(event, callback);
  }

  // Generic event handler for any Socket.IO events
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;
