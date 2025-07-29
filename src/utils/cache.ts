import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { CacheEntry } from '@/types';

interface CacheDB extends DBSchema {
  flags: {
    key: string;
    value: CacheEntry<any>;
  };
  evaluations: {
    key: string;
    value: CacheEntry<any>;
  };
}

class PerformanceCache {
  private db: IDBPDatabase<CacheDB> | null = null;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private maxMemorySize = 100; // Maximum number of items in memory cache
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async init(): Promise<void> {
    try {
      this.db = await openDB<CacheDB>('flags-cache', 1, {
        upgrade(db) {
          db.createObjectStore('flags');
          db.createObjectStore('evaluations');
        },
      });
    } catch (error) {
      console.warn('IndexedDB not available, falling back to memory cache only');
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictExpiredMemoryEntries(): void {
    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size > this.maxMemorySize) {
      // Remove oldest entries first (LRU-like behavior)
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, this.memoryCache.size - this.maxMemorySize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  async get<T>(key: string, store: 'flags' | 'evaluations' = 'flags'): Promise<T | null> {
    // Check memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check IndexedDB cache
    if (this.db) {
      try {
        const entry = await this.db.get(store, key);
        if (entry && !this.isExpired(entry)) {
          // Populate memory cache
          this.memoryCache.set(key, entry);
          this.enforceMemoryLimit();
          return entry.data as T;
        }
      } catch (error) {
        console.warn('IndexedDB read error:', error);
      }
    }

    return null;
  }

  async set<T>(
    key: string, 
    data: T, 
    store: 'flags' | 'evaluations' = 'flags',
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);
    this.evictExpiredMemoryEntries();
    this.enforceMemoryLimit();

    // Set in IndexedDB
    if (this.db) {
      try {
        await this.db.put(store, entry, key);
      } catch (error) {
        console.warn('IndexedDB write error:', error);
      }
    }
  }

  async delete(key: string, store: 'flags' | 'evaluations' = 'flags'): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.db) {
      try {
        await this.db.delete(store, key);
      } catch (error) {
        console.warn('IndexedDB delete error:', error);
      }
    }
  }

  async clear(store?: 'flags' | 'evaluations'): Promise<void> {
    if (store) {
      // Clear specific store
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(store)) {
          this.memoryCache.delete(key);
        }
      }
      
      if (this.db) {
        try {
          await this.db.clear(store);
        } catch (error) {
          console.warn('IndexedDB clear error:', error);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();
      
      if (this.db) {
        try {
          await this.db.clear('flags');
          await this.db.clear('evaluations');
        } catch (error) {
          console.warn('IndexedDB clear error:', error);
        }
      }
    }
  }

  getCacheStats() {
    return {
      memorySize: this.memoryCache.size,
      maxMemorySize: this.maxMemorySize,
    };
  }
}

export const cache = new PerformanceCache();