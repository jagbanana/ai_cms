/**
 * Offline Manager for ChessTrainer.org
 * 
 * Manages offline functionality, service worker communication, and sync operations.
 */

import React from 'react';
import { useLogger } from '../hooks/useLogger';
import { handleError } from './errorHandler';

export interface OfflineAction {
  id: string;
  type: 'PUZZLE_PROGRESS' | 'LESSON_COMPLETION' | 'ERROR_REPORT' | 'ANALYTICS_EVENT';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface CacheStatus {
  staticCacheSize: number;
  apiCacheSize: number;
  queueSize: number;
  cacheNames: string[];
  lastUpdate?: string;
}

export interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  hasCachedContent: boolean;
  queuedActions: number;
  lastSyncTime?: Date;
  estimatedDataUsage?: string;
}

class OfflineManager {
  private logger = useLogger('OfflineManager');
  private isOnline = navigator.onLine;
  private isOfflineMode = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private eventListeners = new Map<string, Set<Function>>();
  private syncInProgress = false;

  constructor() {
    this.initializeServiceWorker();
    this.setupEventListeners();
  }

  /**
   * Initialize service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        this.serviceWorkerRegistration = registration;

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.logger.info('Service worker updated', 'New version available');
                this.emit('sw-update-available');
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

        this.logger.info('Service worker registered', 'Offline support enabled');
      } catch (error) {
        this.logger.error('Service worker registration failed', (error as Error).message);
        await handleError(error as Error, { component: 'OfflineManager' });
      }
    }
  }

  /**
   * Setup event listeners for online/offline detection
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.logger.info('Connection restored', 'Back online');
      this.emit('online');
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logger.warn('Connection lost', 'Gone offline');
      this.emit('offline');
    });

    // Enhanced connectivity detection
    this.setupEnhancedConnectivityDetection();
  }

  /**
   * Enhanced connectivity detection using multiple methods
   */
  private setupEnhancedConnectivityDetection(): void {
    // Network Information API (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.logger.debug('Connection info updated', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          });
        });
      }
    }

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check actual connectivity with a test request
   */
  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });

      const wasOnline = this.isOnline;
      this.isOnline = response.ok;

      if (!wasOnline && this.isOnline) {
        this.logger.info('Connectivity restored', 'Connection test successful');
        this.emit('online');
        this.triggerSync();
      } else if (wasOnline && !this.isOnline) {
        this.logger.warn('Connectivity lost', 'Connection test failed');
        this.emit('offline');
      }

      return this.isOnline;
    } catch (error) {
      if (this.isOnline) {
        this.isOnline = false;
        this.logger.warn('Connectivity lost', 'Connection test failed');
        this.emit('offline');
      }
      return false;
    }
  }

  /**
   * Queue an action for background sync
   */
  public async queueAction(type: OfflineAction['type'], data: any): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service worker not available');
    }

    const action: OfflineAction = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    try {
      const serviceWorker = this.serviceWorkerRegistration.active;
      if (serviceWorker) {
        serviceWorker.postMessage({
          type: 'QUEUE_ACTION',
          data: action
        });

        this.logger.info(`Queued ${type}`, {
          actionId: action.id,
          queuedAt: action.timestamp
        });

        this.emit('action-queued', action);
      }
    } catch (error) {
      this.logger.error((error as Error).message, {
        actionType: type,
        actionId: action.id
      });
      throw error;
    }
  }

  /**
   * Trigger background sync
   */
  public async triggerSync(): Promise<void> {
    if (!this.serviceWorkerRegistration || this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;
      if ('sync' in this.serviceWorkerRegistration) {
        await (this.serviceWorkerRegistration as any).sync.register('chess-trainer-sync');
      } else {
        throw new Error('Background sync not supported');
      }
      this.logger.info('Background sync triggered', 'Sync registration successful');
    } catch (error) {
      this.logger.error('Failed to trigger sync', (error as Error).message);
      await handleError(error as Error, { component: 'OfflineManager' });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get current cache status
   */
  public async getCacheStatus(): Promise<CacheStatus | null> {
    if (!this.serviceWorkerRegistration) {
      return null;
    }

    try {
      const serviceWorker = this.serviceWorkerRegistration.active;
      if (!serviceWorker) {
        return null;
      }

      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve({
            ...event.data,
            lastUpdate: new Date().toISOString()
          });
        };

        serviceWorker.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    } catch (error) {
      this.logger.error('Failed to get cache status', (error as Error).message);
      return null;
    }
  }

  /**
   * Get current offline state
   */
  public async getOfflineState(): Promise<OfflineState> {
    const cacheStatus = await this.getCacheStatus();
    
    return {
      isOnline: this.isOnline,
      isOfflineMode: this.isOfflineMode,
      hasCachedContent: (cacheStatus?.staticCacheSize || 0) > 0 || (cacheStatus?.apiCacheSize || 0) > 0,
      queuedActions: cacheStatus?.queueSize || 0,
      lastSyncTime: undefined, // Could be stored in localStorage
      estimatedDataUsage: this.calculateEstimatedDataUsage(cacheStatus)
    };
  }

  /**
   * Enable offline mode
   */
  public enableOfflineMode(): void {
    this.isOfflineMode = true;
    this.logger.info('Offline mode enabled', 'User activated offline mode');
    this.emit('offline-mode-enabled');
  }

  /**
   * Disable offline mode
   */
  public disableOfflineMode(): void {
    this.isOfflineMode = false;
    this.logger.info('Offline mode disabled', 'User deactivated offline mode');
    this.emit('offline-mode-disabled');
  }

  /**
   * Clear offline queue
   */
  public async clearQueue(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      const serviceWorker = this.serviceWorkerRegistration.active;
      if (serviceWorker) {
        return new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          
          messageChannel.port1.onmessage = () => {
            this.logger.info('Offline queue cleared', 'All queued actions removed');
            this.emit('queue-cleared');
            resolve();
          };

          serviceWorker.postMessage(
            { type: 'CLEAR_QUEUE' },
            [messageChannel.port2]
          );
        });
      }
    } catch (error) {
      this.logger.error('Failed to clear queue', (error as Error).message);
      throw error;
    }
  }

  /**
   * Check if content is available offline
   */
  public async isContentAvailableOffline(url: string): Promise<boolean> {
    try {
      const cache = await caches.open('chess-trainer-api-v1');
      const response = await cache.match(url);
      return !!response;
    } catch (error) {
      return false;
    }
  }

  /**
   * Pre-cache content for offline use
   */
  public async precacheContent(urls: string[]): Promise<void> {
    try {
      const cache = await caches.open('chess-trainer-api-v1');
      await cache.addAll(urls);
      
      this.logger.info(`Cached ${urls.length} resources`, {
        urls: urls.slice(0, 5) // Log first 5 URLs
      });
    } catch (error) {
      this.logger.error((error as Error).message, {
        urlCount: urls.length
      });
      throw error;
    }
  }

  /**
   * Update service worker
   */
  public async updateServiceWorker(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      await this.serviceWorkerRegistration.update();
      this.logger.info('Service worker update check completed', 'Update check performed');
    } catch (error) {
      this.logger.error('Service worker update failed', (error as Error).message);
      throw error;
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          this.logger.error((error as Error).message, {
            event,
            data
          });
        }
      });
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'SYNC_COMPLETE':
        this.logger.info(`Processed ${data.processedCount} items`, {
          processedCount: data.processedCount,
          remainingCount: data.remainingCount
        });
        this.emit('sync-complete', data);
        break;

      case 'CACHE_UPDATED':
        this.logger.info('Cache updated', 'New content cached');
        this.emit('cache-updated', data);
        break;

      default:
        this.logger.debug('Unknown service worker message', { type, data });
    }
  }

  /**
   * Calculate estimated data usage for sync
   */
  private calculateEstimatedDataUsage(cacheStatus: CacheStatus | null): string {
    if (!cacheStatus) {
      return 'Unknown';
    }

    // Rough estimates based on typical data sizes
    const avgActionSize = 0.5; // KB per action
    const estimatedKB = cacheStatus.queueSize * avgActionSize;

    if (estimatedKB < 1) {
      return '< 1 KB';
    } else if (estimatedKB < 1024) {
      return `${Math.round(estimatedKB)} KB`;
    } else {
      return `${(estimatedKB / 1024).toFixed(1)} MB`;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();

// React hook for offline state
export const useOfflineState = () => {
  const [offlineState, setOfflineState] = React.useState<OfflineState | null>(null);

  React.useEffect(() => {
    const updateState = async () => {
      const state = await offlineManager.getOfflineState();
      setOfflineState(state);
    };

    updateState();

    // Listen for offline state changes
    const handleOnline = () => updateState();
    const handleOffline = () => updateState();
    const handleQueueUpdate = () => updateState();

    offlineManager.on('online', handleOnline);
    offlineManager.on('offline', handleOffline);
    offlineManager.on('action-queued', handleQueueUpdate);
    offlineManager.on('sync-complete', handleQueueUpdate);

    return () => {
      offlineManager.off('online', handleOnline);
      offlineManager.off('offline', handleOffline);
      offlineManager.off('action-queued', handleQueueUpdate);
      offlineManager.off('sync-complete', handleQueueUpdate);
    };
  }, []);

  return offlineState;
};

export default offlineManager;