import { useMemo, useCallback } from 'react';
import { useFlagStore, useFlagValue } from '@/stores/flagStore';
import { performanceMonitor, debounce } from '@/utils/performance';
import { useFlagContext } from '@/components/FlagProvider';

/**
 * High-performance hook for checking a single feature flag
 * Uses memoization and optimized selectors to prevent unnecessary re-renders
 */
export const useFeatureFlag = (flagId: string): boolean => {
  const { isReady } = useFlagContext();
  const value = useFlagValue(flagId);
  
  return useMemo(() => {
    if (!isReady) return false;
    
    performanceMonitor.startMeasurement(`useFeatureFlag:${flagId}`);
    const result = value;
    performanceMonitor.endMeasurement(`useFeatureFlag:${flagId}`);
    
    return result;
  }, [isReady, value, flagId]);
};

/**
 * Hook for checking multiple feature flags efficiently
 * Batches evaluations for better performance
 */
export const useFeatureFlags = (flagIds: string[]): Record<string, boolean> => {
  const { isReady } = useFlagContext();
  const evaluateFlags = useFlagStore(state => state.evaluateFlags);
  
  return useMemo(() => {
    if (!isReady) {
      return flagIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
    }
    
    performanceMonitor.startMeasurement('useFeatureFlags:batch');
    const results = evaluateFlags(flagIds);
    performanceMonitor.endMeasurement('useFeatureFlags:batch');
    
    return results;
  }, [isReady, evaluateFlags, flagIds]);
};

/**
 * Hook for conditional rendering based on feature flags
 * Returns a memoized render function for optimal performance
 */
export const useConditionalRender = <T = any>(
  flagId: string,
  enabledComponent: React.ComponentType<T> | React.ReactElement,
  disabledComponent?: React.ComponentType<T> | React.ReactElement | null
) => {
  const isEnabled = useFeatureFlag(flagId);
  
  return useCallback((props?: T) => {
    if (isEnabled) {
      return typeof enabledComponent === 'function' 
        ? React.createElement(enabledComponent, props)
        : enabledComponent;
    }
    
    if (disabledComponent) {
      return typeof disabledComponent === 'function'
        ? React.createElement(disabledComponent, props)
        : disabledComponent;
    }
    
    return null;
  }, [isEnabled, enabledComponent, disabledComponent]);
};

/**
 * Hook for refreshing flags with debounced updates
 * Useful for real-time flag updates without overwhelming the system
 */
export const useFlagRefresh = () => {
  const refreshFlag = useFlagStore(state => state.refreshFlag);
  const loadFlags = useFlagStore(state => state.loadFlags);
  
  const debouncedRefreshFlag = useMemo(
    () => debounce(refreshFlag, 1000),
    [refreshFlag]
  );
  
  const debouncedLoadFlags = useMemo(
    () => debounce(loadFlags, 2000),
    [loadFlags]
  );
  
  return {
    refreshFlag: debouncedRefreshFlag,
    refreshAllFlags: debouncedLoadFlags,
  };
};

/**
 * Hook for accessing flag system metrics
 * Useful for monitoring performance in development/debugging
 */
export const useFlagMetrics = () => {
  const metrics = useFlagStore(state => state.metrics);
  const performanceMetrics = useMemo(() => performanceMonitor.getAllMetrics(), []);
  
  return useMemo(() => ({
    systemMetrics: metrics,
    performanceMetrics,
    cacheStats: typeof window !== 'undefined' ? {
      // Add cache stats if needed
    } : {},
  }), [metrics, performanceMetrics]);
};

/**
 * Hook for A/B testing scenarios
 * Provides utilities for variant selection and tracking
 */
export const useABTest = (testId: string, variants: string[] = ['control', 'variant']) => {
  const isEnabled = useFeatureFlag(testId);
  const user = useFlagStore(state => state.user);
  
  const selectedVariant = useMemo(() => {
    if (!isEnabled || !user) return variants[0]; // Default to control
    
    // Simple hash-based variant selection for consistency
    const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variantIndex = hash % variants.length;
    
    return variants[variantIndex];
  }, [isEnabled, user, variants, testId]);
  
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    // Placeholder for analytics tracking
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(eventName, {
        ...properties,
        testId,
        variant: selectedVariant,
        userId: user?.id,
      });
    }
  }, [testId, selectedVariant, user]);
  
  return {
    isEnabled,
    variant: selectedVariant,
    isControl: selectedVariant === variants[0],
    trackEvent,
  };
};