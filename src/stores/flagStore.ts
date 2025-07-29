import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StoreState, FeatureFlag, User, FlagEvaluation, PerformanceMetrics } from '@/types';
import { cache } from '@/utils/cache';
import { performanceMonitor, memoizeWithTTL, BatchProcessor } from '@/utils/performance';

interface FlagStore extends StoreState {
  // Actions
  setFlags: (flags: FeatureFlag[]) => void;
  setUser: (user: User) => void;
  evaluateFlag: (flagId: string, user?: User) => boolean;
  evaluateFlags: (flagIds: string[], user?: User) => Record<string, boolean>;
  loadFlags: () => Promise<void>;
  refreshFlag: (flagId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  clearCache: () => Promise<void>;
}

// Optimized flag evaluation with memoization
const evaluateFlagLogic = memoizeWithTTL((flag: FeatureFlag, user: User | null): boolean => {
  if (!flag || !flag.enabled) return false;

  // Simple evaluation - can be extended with complex rules
  if (!flag.rules || flag.rules.length === 0) {
    return flag.enabled;
  }

  // Evaluate rules
  for (const rule of flag.rules) {
    if (rule.userSegments && user) {
      const hasMatchingSegment = rule.userSegments.some(segment => 
        user.segments.includes(segment)
      );
      if (hasMatchingSegment) {
        if (rule.percentage) {
          // Simple percentage rollout based on user ID hash
          const hash = hashString(user.id);
          return (hash % 100) < rule.percentage;
        }
        return rule.value;
      }
    }
  }

  return flag.enabled;
}, 30000); // 30 second TTL for evaluations

// Simple hash function for consistent user percentage rollouts
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Batch processor for API calls
const flagBatchProcessor = new BatchProcessor<string, FeatureFlag>(
  async (flagIds: string[]) => {
    // Simulate API call - replace with real implementation
    const response = await fetch('/api/flags/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagIds }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flags: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.flags;
  },
  5, // batch size
  100 // delay in ms
);

export const useFlagStore = create<FlagStore>()(
  subscribeWithSelector((set, get) => ({
    flags: {},
    user: null,
    evaluations: {},
    metrics: {
      evaluationTime: 0,
      cacheHitRate: 0,
      bundleSize: 0,
      loadTime: 0,
      memoryUsage: 0,
    },
    loading: false,
    error: null,

    setFlags: (flags: FeatureFlag[]) => {
      performanceMonitor.startMeasurement('setFlags');
      
      const flagsMap = flags.reduce((acc, flag) => {
        acc[flag.id] = flag;
        // Cache individual flags
        cache.set(`flag:${flag.id}`, flag, 'flags');
        return acc;
      }, {} as Record<string, FeatureFlag>);

      set({ flags: flagsMap });
      
      // Cache the entire flags collection
      cache.set('flags:all', flagsMap, 'flags');
      
      performanceMonitor.endMeasurement('setFlags');
    },

    setUser: (user: User) => {
      set({ user });
      // Clear evaluations when user changes
      set({ evaluations: {} });
      cache.clear('evaluations');
    },

    evaluateFlag: (flagId: string, user?: User) => {
      performanceMonitor.startMeasurement('evaluateFlag');
      
      const state = get();
      const currentUser = user || state.user;
      const flag = state.flags[flagId];
      
      if (!flag) {
        performanceMonitor.endMeasurement('evaluateFlag');
        return false;
      }

      // Check cache first
      const cacheKey = `eval:${flagId}:${currentUser?.id || 'anonymous'}`;
      const cachedEvaluation = state.evaluations[cacheKey];
      
      if (cachedEvaluation && Date.now() - cachedEvaluation.timestamp < 60000) { // 1 minute cache
        performanceMonitor.endMeasurement('evaluateFlag');
        return cachedEvaluation.value;
      }

      const result = evaluateFlagLogic(flag, currentUser);
      const evaluation: FlagEvaluation = {
        flagId,
        value: result,
        reason: result ? 'enabled' : 'disabled',
        timestamp: Date.now(),
      };

      // Update evaluations cache
      set(state => ({
        evaluations: {
          ...state.evaluations,
          [cacheKey]: evaluation,
        },
      }));

      // Cache evaluation
      cache.set(cacheKey, evaluation, 'evaluations', 60000);
      
      const duration = performanceMonitor.endMeasurement('evaluateFlag');
      
      // Update metrics
      get().updateMetrics({ evaluationTime: duration });
      
      return result;
    },

    evaluateFlags: (flagIds: string[], user?: User) => {
      performanceMonitor.startMeasurement('evaluateFlags');
      
      const results: Record<string, boolean> = {};
      const currentUser = user || get().user;
      
      for (const flagId of flagIds) {
        results[flagId] = get().evaluateFlag(flagId, currentUser);
      }
      
      performanceMonitor.endMeasurement('evaluateFlags');
      return results;
    },

    loadFlags: async () => {
      set({ loading: true, error: null });
      
      try {
        performanceMonitor.startMeasurement('loadFlags');
        
        // Try cache first
        const cachedFlags = await cache.get<Record<string, FeatureFlag>>('flags:all');
        if (cachedFlags) {
          set({ flags: cachedFlags, loading: false });
          performanceMonitor.endMeasurement('loadFlags');
          return;
        }

        // Fetch from API
        const response = await fetch('/api/flags');
        if (!response.ok) {
          throw new Error(`Failed to load flags: ${response.statusText}`);
        }
        
        const data = await response.json();
        get().setFlags(data.flags);
        
        set({ loading: false });
        performanceMonitor.endMeasurement('loadFlags');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set({ error: errorMessage, loading: false });
        performanceMonitor.endMeasurement('loadFlags');
      }
    },

    refreshFlag: async (flagId: string) => {
      try {
        const flag = await flagBatchProcessor.add(flagId);
        const state = get();
        
        set({
          flags: {
            ...state.flags,
            [flagId]: flag,
          },
        });
        
        // Update cache
        cache.set(`flag:${flagId}`, flag, 'flags');
        
        // Clear evaluations for this flag
        const newEvaluations = { ...state.evaluations };
        Object.keys(newEvaluations).forEach(key => {
          if (key.startsWith(`eval:${flagId}:`)) {
            delete newEvaluations[key];
          }
        });
        set({ evaluations: newEvaluations });
        
      } catch (error) {
        console.error('Failed to refresh flag:', error);
      }
    },

    setLoading: (loading: boolean) => set({ loading }),
    
    setError: (error: string | null) => set({ error }),
    
    updateMetrics: (metrics: Partial<PerformanceMetrics>) => {
      set(state => ({
        metrics: { ...state.metrics, ...metrics },
      }));
    },

    clearCache: async () => {
      await cache.clear();
      set({ evaluations: {} });
    },
  }))
);

// Selector hooks for better performance (prevents unnecessary re-renders)
export const useFlagValue = (flagId: string) => 
  useFlagStore(state => state.evaluateFlag(flagId));

export const useFlags = () => 
  useFlagStore(state => state.flags);

export const useFlagLoading = () => 
  useFlagStore(state => state.loading);

export const useFlagError = () => 
  useFlagStore(state => state.error);

export const useMetrics = () => 
  useFlagStore(state => state.metrics);