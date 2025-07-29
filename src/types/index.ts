export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules?: FlagRule[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface FlagRule {
  id: string;
  condition: string;
  value: boolean;
  percentage?: number;
  userSegments?: string[];
  environment?: string;
}

export interface User {
  id: string;
  email?: string;
  segments: string[];
  properties: Record<string, any>;
}

export interface FlagEvaluation {
  flagId: string;
  value: boolean;
  reason: string;
  timestamp: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  evaluationTime: number;
  cacheHitRate: number;
  bundleSize: number;
  loadTime: number;
  memoryUsage: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface StoreState {
  flags: Record<string, FeatureFlag>;
  user: User | null;
  evaluations: Record<string, FlagEvaluation>;
  metrics: PerformanceMetrics;
  loading: boolean;
  error: string | null;
}