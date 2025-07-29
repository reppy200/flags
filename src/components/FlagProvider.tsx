import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useFlagStore } from '@/stores/flagStore';
import { cache } from '@/utils/cache';
import { performanceMonitor } from '@/utils/performance';

interface FlagContextValue {
  isReady: boolean;
  error: string | null;
}

const FlagContext = createContext<FlagContextValue>({
  isReady: false,
  error: null,
});

interface FlagProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
  userId?: string;
  userSegments?: string[];
  onReady?: () => void;
  fallbackFlags?: Record<string, boolean>;
}

export const FlagProvider: React.FC<FlagProviderProps> = ({
  children,
  apiEndpoint = '/api/flags',
  userId,
  userSegments = [],
  onReady,
  fallbackFlags = {},
}) => {
  const initializationRef = useRef(false);
  const loadFlags = useFlagStore(state => state.loadFlags);
  const setUser = useFlagStore(state => state.setUser);
  const loading = useFlagStore(state => state.loading);
  const error = useFlagStore(state => state.error);
  const setError = useFlagStore(state => state.setError);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeFlags = async () => {
      try {
        performanceMonitor.startMeasurement('flagProvider:init');
        
        // Initialize cache
        await cache.init();
        
        // Set user if provided
        if (userId) {
          setUser({
            id: userId,
            segments: userSegments,
            properties: {},
          });
        }
        
        // Load flags
        await loadFlags();
        
        const duration = performanceMonitor.endMeasurement('flagProvider:init');
        console.log(`Flag system initialized in ${duration.toFixed(2)}ms`);
        
        onReady?.();
      } catch (error) {
        console.error('Failed to initialize flag system:', error);
        setError(error instanceof Error ? error.message : 'Initialization failed');
      }
    };

    initializeFlags();
  }, [loadFlags, setUser, setError, userId, userSegments, onReady]);

  // Update user when props change
  useEffect(() => {
    if (userId && !loading) {
      setUser({
        id: userId,
        segments: userSegments,
        properties: {},
      });
    }
  }, [userId, userSegments, setUser, loading]);

  const isReady = !loading && !error;

  return (
    <FlagContext.Provider value={{ isReady, error }}>
      {children}
    </FlagContext.Provider>
  );
};

export const useFlagContext = () => {
  const context = useContext(FlagContext);
  if (!context) {
    throw new Error('useFlagContext must be used within a FlagProvider');
  }
  return context;
};