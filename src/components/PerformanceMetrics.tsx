import React, { memo, useEffect, useState } from 'react';
import { useFlagMetrics } from '@/hooks/useFeatureFlag';
import { performanceMonitor } from '@/utils/performance';
import { cache } from '@/utils/cache';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

const MetricCard = memo<MetricCardProps>(({ title, value, unit, trend, description }) => (
  <div className="metric-card">
    <div className="metric-header">
      <h3>{title}</h3>
      {trend && <span className={`trend trend-${trend}`}>●</span>}
    </div>
    <div className="metric-value">
      {value}
      {unit && <span className="metric-unit">{unit}</span>}
    </div>
    {description && <p className="metric-description">{description}</p>}
  </div>
));

MetricCard.displayName = 'MetricCard';

export const PerformanceMetrics: React.FC = memo(() => {
  const { systemMetrics, performanceMetrics } = useFlagMetrics();
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    // Calculate bundle size (approximation)
    const calculateBundleSize = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(r => r.name.includes('.js'));
        const totalSize = jsResources.reduce((sum, resource) => {
          return sum + (resource.transferSize || 0);
        }, 0);
        setBundleSize(Math.round(totalSize / 1024)); // Convert to KB
      }
    };

    // Calculate memory usage
    const calculateMemoryUsage = () => {
      if (typeof window !== 'undefined' && (window.performance as any).memory) {
        const memory = (window.performance as any).memory;
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024)); // Convert to MB
      }
    };

    calculateBundleSize();
    calculateMemoryUsage();

    const interval = setInterval(() => {
      calculateMemoryUsage();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getCacheStats = () => {
    return cache.getCacheStats();
  };

  return (
    <div className="performance-metrics">
      <header className="metrics-header">
        <h1>Performance Metrics</h1>
        <button 
          onClick={() => performanceMonitor.clear()}
          className="clear-metrics-btn"
        >
          Clear Metrics
        </button>
      </header>

      <div className="metrics-grid">
        {/* System Metrics */}
        <section className="metrics-section">
          <h2>System Performance</h2>
          <div className="metrics-row">
            <MetricCard
              title="Flag Evaluation Time"
              value={formatDuration(systemMetrics.evaluationTime)}
              description="Average time to evaluate a feature flag"
            />
            <MetricCard
              title="Cache Hit Rate"
              value={systemMetrics.cacheHitRate}
              unit="%"
              description="Percentage of cache hits vs misses"
            />
            <MetricCard
              title="Load Time"
              value={formatDuration(systemMetrics.loadTime)}
              description="Time to load flag system"
            />
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="metrics-section">
          <h2>Application Performance</h2>
          <div className="metrics-row">
            <MetricCard
              title="Bundle Size"
              value={bundleSize}
              unit="KB"
              description="Total JavaScript bundle size"
            />
            <MetricCard
              title="Memory Usage"
              value={memoryUsage}
              unit="MB"
              description="Current JavaScript heap size"
            />
          </div>
        </section>

        {/* Cache Metrics */}
        <section className="metrics-section">
          <h2>Cache Performance</h2>
          <div className="metrics-row">
            <MetricCard
              title="Memory Cache Size"
              value={getCacheStats().memorySize}
              description="Number of items in memory cache"
            />
            <MetricCard
              title="Cache Limit"
              value={getCacheStats().maxMemorySize}
              description="Maximum memory cache capacity"
            />
          </div>
        </section>

        {/* Detailed Performance Metrics */}
        <section className="metrics-section">
          <h2>Detailed Performance</h2>
          <div className="detailed-metrics">
            {Object.entries(performanceMetrics).map(([name, metric]) => (
              <div key={name} className="detailed-metric">
                <h4>{name}</h4>
                <div className="metric-details">
                  <span>Avg: {formatDuration(metric.avg)}</span>
                  <span>P95: {formatDuration(metric.p95)}</span>
                  <span>P99: {formatDuration(metric.p99)}</span>
                  <span>Count: {metric.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';