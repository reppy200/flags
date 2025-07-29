export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private startTimes = new Map<string, number>();

  startMeasurement(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  endMeasurement(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(name);

    // Store measurement
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const measurements = this.metrics.get(name)!;
    measurements.push(duration);

    // Keep only last 100 measurements to prevent memory leaks
    if (measurements.length > 100) {
      measurements.shift();
    }

    return duration;
  }

  getAverage(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
  }

  getPercentile(name: string, percentile: number): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getAllMetrics() {
    const result: Record<string, { avg: number; p95: number; p99: number; count: number }> = {};
    
    for (const [name, measurements] of this.metrics) {
      result[name] = {
        avg: this.getAverage(name),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
        count: measurements.length,
      };
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization with TTL for expensive calculations
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000 // 1 minute default
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });

    // Clean up expired entries
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp >= ttl) {
        cache.delete(k);
      }
    }

    return result;
  }) as T;
}

// Batch function calls to reduce overhead
export class BatchProcessor<T, R> {
  private queue: Array<{ item: T; resolve: (value: R) => void; reject: (error: any) => void }> = [];
  private processor: (items: T[]) => Promise<R[]>;
  private batchSize: number;
  private delay: number;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    delay: number = 50
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map(b => b.item);

    try {
      const results = await this.processor(items);
      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(b => b.reject(error));
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();