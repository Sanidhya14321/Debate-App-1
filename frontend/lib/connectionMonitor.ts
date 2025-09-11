// lib/connectionMonitor.ts
import { toast } from 'sonner';
import { API_URL } from './api';

export class ConnectionMonitor {
  private isOnline: boolean = true;
  private checkInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.startHealthCheck();
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.isOnline = true;
    this.reconnectAttempts = 0;
    toast.success('Connection restored');
    this.startHealthCheck();
  }

  private handleOffline() {
    this.isOnline = false;
    toast.error('Connection lost. Please check your internet connection.');
    this.stopHealthCheck();
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private startHealthCheck() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      if (!this.isOnline) return;

      const isHealthy = await this.checkBackendHealth();
      
      if (!isHealthy) {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          toast.error(`Backend connection failed. Retrying... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        } else {
          toast.error('Backend is unreachable. Please try refreshing the page.');
          this.stopHealthCheck();
        }
      } else {
        if (this.reconnectAttempts > 0) {
          toast.success('Backend connection restored');
          this.reconnectAttempts = 0;
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private stopHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public getConnectionStatus(): { isOnline: boolean; reconnectAttempts: number } {
    return {
      isOnline: this.isOnline,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  public destroy() {
    this.stopHealthCheck();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();
