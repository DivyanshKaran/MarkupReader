# Performance Architecture

## Overview

RailConnect India implements a comprehensive performance architecture that ensures optimal response times, high throughput, and excellent user experience across all components.

## Performance Principles

### Scalability
- **Horizontal Scaling**: Add more instances to handle increased load
- **Vertical Scaling**: Increase resources of existing instances
- **Auto-scaling**: Dynamic scaling based on metrics
- **Load Distribution**: Efficient load balancing across instances

### Optimization
- **Caching Strategy**: Multi-level caching for frequently accessed data
- **Database Optimization**: Query optimization and indexing
- **CDN Integration**: Global content delivery for static assets
- **Code Optimization**: Efficient algorithms and data structures

### Monitoring
- **Real-time Metrics**: Continuous performance monitoring
- **Alerting**: Proactive alerts for performance issues
- **Profiling**: Detailed performance analysis
- **Capacity Planning**: Predictive scaling based on trends

## Frontend Performance

### Code Splitting and Lazy Loading

#### Route-based Code Splitting
```typescript
// app/layout.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const TrainSearch = dynamic(() => import('@/components/features/TrainSearch'), {
  loading: () => <SearchSkeleton />,
  ssr: false,
});

const BookingFlow = dynamic(() => import('@/components/features/BookingFlow'), {
  loading: () => <BookingSkeleton />,
  ssr: false,
});

const Dashboard = dynamic(() => import('@/components/features/Dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

// Route-based splitting
const routes = {
  '/search': TrainSearch,
  '/booking': BookingFlow,
  '/dashboard': Dashboard,
};
```

#### Component-level Code Splitting
```typescript
// components/features/TrainSearch.tsx
import { lazy, Suspense } from 'react';

const StationAutocomplete = lazy(() => import('./StationAutocomplete'));
const DatePicker = lazy(() => import('./DatePicker'));
const PassengerSelector = lazy(() => import('./PassengerSelector'));

export function TrainSearch() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <StationAutocomplete />
      </Suspense>
      
      <Suspense fallback={<div>Loading...</div>}>
        <DatePicker />
      </Suspense>
      
      <Suspense fallback={<div>Loading...</div>}>
        <PassengerSelector />
      </Suspense>
    </div>
  );
}
```

### Image Optimization

#### Next.js Image Component
```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
```

#### Responsive Images
```typescript
// components/ui/ResponsiveImage.tsx
export function ResponsiveImage({ src, alt, className }: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      priority={false}
    />
  );
}
```

### Bundle Optimization

#### Webpack Configuration
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Enable tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Optimize chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Enable Brotli compression
    if (!isServer && process.env.NODE_ENV === 'production') {
      const CompressionPlugin = require('compression-webpack-plugin');
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        })
      );
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

#### Performance Budgets
```javascript
// scripts/performance-budget.js
const BUDGETS = {
  'apps/web/.next/static/chunks/pages/_app.js': 200 * 1024, // 200KB
  'apps/web/.next/static/chunks/pages/index.js': 150 * 1024, // 150KB
  'apps/web/.next/static/chunks/pages/search.js': 300 * 1024, // 300KB
  'apps/web/.next/static/chunks/pages/booking.js': 400 * 1024, // 400KB
};

function checkPerformanceBudgets() {
  console.log('Checking performance budgets...');
  let allBudgetsMet = true;

  for (const [filePath, budgetBytes] of Object.entries(BUDGETS)) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const fileSize = stats.size;

      if (fileSize > budgetBytes) {
        console.error(
          `❌ Budget exceeded for ${filePath}: ${
            (fileSize / 1024).toFixed(2)
          }KB (Budget: ${(budgetBytes / 1024).toFixed(2)}KB)`
        );
        allBudgetsMet = false;
      } else {
        console.log(
          `✅ Budget met for ${filePath}: ${
            (fileSize / 1024).toFixed(2)
          }KB (Budget: ${(budgetBytes / 1024).toFixed(2)}KB)`
        );
      }
    }
  }

  if (allBudgetsMet) {
    console.log('All performance budgets are within limits. ✨');
    process.exit(0);
  } else {
    console.error('One or more performance budgets were exceeded. 🚨');
    process.exit(1);
  }
}

checkPerformanceBudgets();
```

### Caching Strategy

#### Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'railconnect-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

#### HTTP Caching
```typescript
// middleware/caching.ts
export function cachingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set cache headers based on content type
  if (req.path.startsWith('/api/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'private, max-age=300');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  // ETag support
  const etag = generateETag(req.url);
  res.setHeader('ETag', etag);

  // Check if client has cached version
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  next();
}
```

## Backend Performance

### Database Optimization

#### Query Optimization
```typescript
// services/database/queryOptimizer.ts
export class QueryOptimizer {
  async optimizeQuery(query: string, params: any[]): Promise<OptimizedQuery> {
    // Analyze query plan
    const plan = await this.analyzeQueryPlan(query, params);
    
    // Suggest optimizations
    const optimizations = this.suggestOptimizations(plan);
    
    // Apply optimizations
    const optimizedQuery = this.applyOptimizations(query, optimizations);
    
    return {
      originalQuery: query,
      optimizedQuery,
      optimizations,
      estimatedImprovement: this.calculateImprovement(plan, optimizations),
    };
  }

  private async analyzeQueryPlan(query: string, params: any[]): Promise<QueryPlan> {
    const result = await this.database.query(`EXPLAIN ANALYZE ${query}`, params);
    return this.parseQueryPlan(result.rows[0]);
  }

  private suggestOptimizations(plan: QueryPlan): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check for missing indexes
    if (plan.hasSequentialScan && plan.rowsScanned > 1000) {
      optimizations.push({
        type: 'INDEX',
        description: 'Add index on frequently queried columns',
        impact: 'HIGH',
      });
    }

    // Check for expensive sorts
    if (plan.hasSort && plan.sortCost > 100) {
      optimizations.push({
        type: 'SORT_OPTIMIZATION',
        description: 'Consider adding index for ORDER BY clause',
        impact: 'MEDIUM',
      });
    }

    // Check for N+1 queries
    if (plan.hasNPlusOne) {
      optimizations.push({
        type: 'N_PLUS_ONE',
        description: 'Use JOIN or batch loading to avoid N+1 queries',
        impact: 'HIGH',
      });
    }

    return optimizations;
  }
}
```

#### Connection Pooling
```typescript
// services/database/connectionPool.ts
import { Pool } from 'pg';

export class DatabaseConnectionPool {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of connections
      min: 5,  // Minimum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Monitor pool metrics
    this.monitorPoolMetrics();
  }

  async getConnection(): Promise<PoolClient> {
    const startTime = Date.now();
    
    try {
      const client = await this.pool.connect();
      const duration = Date.now() - startTime;
      
      // Log slow connections
      if (duration > 1000) {
        console.warn(`Slow database connection: ${duration}ms`);
      }
      
      return client;
    } catch (error) {
      console.error('Failed to get database connection:', error);
      throw error;
    }
  }

  private monitorPoolMetrics(): void {
    setInterval(() => {
      const metrics = {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
      };
      
      console.log('Database pool metrics:', metrics);
      
      // Alert if pool is exhausted
      if (metrics.waitingCount > 5) {
        console.warn('Database connection pool is under pressure');
      }
    }, 30000); // Check every 30 seconds
  }
}
```

### Caching Layer

#### Redis Caching
```typescript
// services/cache/redisCache.ts
import Redis from 'ioredis';

export class RedisCache {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // Cache with fallback
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await fallback();
      await this.set(key, value, ttl);
    }
    
    return value;
  }
}
```

#### Application-level Caching
```typescript
// services/cache/applicationCache.ts
export class ApplicationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;
  private ttl: number = 300000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): CacheStats {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > this.ttl) {
        expiredCount++;
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      hitRate: this.calculateHitRate(),
    };
  }
}
```

### API Performance

#### Request Batching
```typescript
// services/api/requestBatcher.ts
export class RequestBatcher {
  private batches: Map<string, BatchRequest[]> = new Map();
  private batchTimeout: number = 100; // 100ms
  private maxBatchSize: number = 50;

  async batchRequest<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchKey = this.getBatchKey(key);
      
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
        
        // Schedule batch processing
        setTimeout(() => {
          this.processBatch(batchKey);
        }, this.batchTimeout);
      }
      
      const batch = this.batches.get(batchKey)!;
      batch.push({ request, resolve, reject });
      
      // Process batch if it's full
      if (batch.length >= this.maxBatchSize) {
        this.processBatch(batchKey);
      }
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }
    
    this.batches.delete(batchKey);
    
    try {
      // Execute all requests in parallel
      const results = await Promise.allSettled(
        batch.map(item => item.request())
      );
      
      // Resolve or reject each promise
      results.forEach((result, index) => {
        const { resolve, reject } = batch[index];
        
        if (result.status === 'fulfilled') {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all promises if batch processing fails
      batch.forEach(({ reject }) => reject(error));
    }
  }
}
```

#### Response Compression
```typescript
// middleware/compression.ts
import compression from 'compression';

export const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for all other requests
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  memLevel: 8, // Memory level for compression
  chunkSize: 16 * 1024, // Chunk size for compression
});
```

## Monitoring and Profiling

### Performance Monitoring

#### Custom Metrics
```typescript
// services/monitoring/performanceMonitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();

  startTimer(name: string): void {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    });
  }

  endTimer(name: string): number {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Timer ${name} not found`);
      return 0;
    }
    
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation: ${name} took ${metric.duration}ms`);
    }
    
    return metric.duration;
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };
    
    // Send to monitoring service
    this.sendToMonitoring(metric);
  }

  private sendToMonitoring(metric: Metric): void {
    // Send to Prometheus, DataDog, or other monitoring service
    console.log('Metric:', metric);
  }
}
```

#### Real User Monitoring (RUM)
```typescript
// services/monitoring/rumService.ts
export class RUMService {
  collectPageMetrics(): void {
    // Collect Core Web Vitals
    this.collectCoreWebVitals();
    
    // Collect navigation timing
    this.collectNavigationTiming();
    
    // Collect resource timing
    this.collectResourceTiming();
  }

  private collectCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.sendMetric('lcp', lastEntry.startTime, {
        url: window.location.pathname,
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.sendMetric('fid', entry.processingStart - entry.startTime, {
          url: window.location.pathname,
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.sendMetric('cls', clsValue, {
        url: window.location.pathname,
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private sendMetric(name: string, value: number, tags: Record<string, string>): void {
    // Send to monitoring service
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        tags,
        timestamp: Date.now(),
      }),
    });
  }
}
```

### Profiling

#### CPU Profiling
```typescript
// services/profiling/cpuProfiler.ts
import { performance } from 'perf_hooks';

export class CPUProfiler {
  private profiles: Map<string, Profile> = new Map();

  startProfile(name: string): void {
    const profile = {
      name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memoryUsage: process.memoryUsage(),
    };
    
    this.profiles.set(name, profile);
  }

  endProfile(name: string): Profile | null {
    const profile = this.profiles.get(name);
    if (!profile) {
      return null;
    }
    
    profile.endTime = performance.now();
    profile.duration = profile.endTime - profile.startTime;
    
    // Log slow profiles
    if (profile.duration > 100) {
      console.warn(`Slow CPU operation: ${name} took ${profile.duration}ms`);
    }
    
    return profile;
  }

  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        
        const cpuPercent = (endUsage.user + endUsage.system) / 1000 / (endTime - startTime) * 100;
        resolve(cpuPercent);
      }, 100);
    });
  }
}
```

#### Memory Profiling
```typescript
// services/profiling/memoryProfiler.ts
export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];

  takeSnapshot(label: string): MemorySnapshot {
    const snapshot = {
      label,
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external,
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }
    
    return snapshot;
  }

  compareSnapshots(snapshot1: MemorySnapshot, snapshot2: MemorySnapshot): MemoryComparison {
    return {
      heapUsedDiff: snapshot2.heapUsed - snapshot1.heapUsed,
      heapTotalDiff: snapshot2.heapTotal - snapshot1.heapTotal,
      externalDiff: snapshot2.external - snapshot1.external,
      timeDiff: snapshot2.timestamp - snapshot1.timestamp,
    };
  }

  detectMemoryLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];
    
    for (let i = 1; i < this.snapshots.length; i++) {
      const prev = this.snapshots[i - 1];
      const curr = this.snapshots[i];
      
      // Check for increasing heap usage
      if (curr.heapUsed > prev.heapUsed * 1.1) {
        leaks.push({
          type: 'HEAP_GROWTH',
          severity: 'MEDIUM',
          description: `Heap usage increased by ${((curr.heapUsed - prev.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
          timestamp: curr.timestamp,
        });
      }
      
      // Check for external memory growth
      if (curr.external > prev.external * 1.2) {
        leaks.push({
          type: 'EXTERNAL_GROWTH',
          severity: 'HIGH',
          description: `External memory increased by ${((curr.external - prev.external) / 1024 / 1024).toFixed(2)}MB`,
          timestamp: curr.timestamp,
        });
      }
    }
    
    return leaks;
  }
}
```

## Load Testing

### K6 Load Tests

#### API Load Testing
```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

export default function() {
  // Test train search endpoint
  let response = http.get('http://localhost:3000/api/trains/search?from=Mumbai&to=Delhi&date=2024-02-01');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has results': (r) => JSON.parse(r.body).routes.length > 0,
  });
  
  sleep(1);
  
  // Test booking endpoint
  let bookingResponse = http.post('http://localhost:3000/api/bookings', {
    trainId: '12345',
    passengers: [{ name: 'Test User', age: 30 }],
    date: '2024-02-01',
  });
  
  check(bookingResponse, {
    'booking status is 201': (r) => r.status === 201,
    'booking response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
```

#### Database Load Testing
```javascript
// tests/load/database-load-test.js
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.1'],
  },
};

const testData = new SharedArray('test data', function() {
  return JSON.parse(open('./test-data.json'));
});

export default function() {
  const data = testData[Math.floor(Math.random() * testData.length)];
  
  // Test database queries
  const response = http.post('http://localhost:3000/api/database/query', {
    query: 'SELECT * FROM trains WHERE source = ? AND destination = ?',
    params: [data.source, data.destination],
  });
  
  const success = check(response, {
    'query successful': (r) => r.status === 200,
    'query time < 100ms': (r) => r.timings.duration < 100,
  });
  
  errorRate.add(!success);
}
```

## Performance Optimization Strategies

### Database Optimization

#### Index Optimization
```sql
-- Create composite indexes for common query patterns
CREATE INDEX idx_bookings_user_date_status ON bookings(user_id, journey_date, status);
CREATE INDEX idx_trains_source_destination ON trains(source_station_id, destination_station_id);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);

-- Create partial indexes for filtered queries
CREATE INDEX idx_active_users ON users(id) WHERE is_active = true;
CREATE INDEX idx_confirmed_bookings ON bookings(id) WHERE status = 'confirmed';

-- Create covering indexes to avoid table lookups
CREATE INDEX idx_booking_summary ON bookings(user_id, journey_date, status, total_fare, pnr_number);
```

#### Query Optimization
```sql
-- Use EXPLAIN ANALYZE to identify bottlenecks
EXPLAIN ANALYZE SELECT * FROM bookings 
WHERE user_id = 'user-123' 
  AND journey_date >= CURRENT_DATE 
  AND status = 'confirmed'
ORDER BY journey_date;

-- Optimize with proper indexing
CREATE INDEX idx_bookings_user_date_status ON bookings(user_id, journey_date, status);

-- Use materialized views for complex aggregations
CREATE MATERIALIZED VIEW user_booking_stats AS
SELECT 
    user_id,
    COUNT(*) as total_bookings,
    SUM(total_fare) as total_spent,
    AVG(total_fare) as avg_fare
FROM bookings
WHERE status = 'confirmed'
GROUP BY user_id;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW user_booking_stats;
```

### Caching Optimization

#### Multi-level Caching
```typescript
// services/cache/multiLevelCache.ts
export class MultiLevelCache {
  private l1Cache: ApplicationCache; // In-memory cache
  private l2Cache: RedisCache;       // Redis cache
  private l3Cache: DatabaseCache;    // Database cache

  constructor() {
    this.l1Cache = new ApplicationCache();
    this.l2Cache = new RedisCache();
    this.l3Cache = new DatabaseCache();
  }

  async get<T>(key: string): Promise<T | null> {
    // L1 Cache (fastest)
    let value = this.l1Cache.get<T>(key);
    if (value !== null) {
      return value;
    }

    // L2 Cache (Redis)
    value = await this.l2Cache.get<T>(key);
    if (value !== null) {
      this.l1Cache.set(key, value);
      return value;
    }

    // L3 Cache (Database)
    value = await this.l3Cache.get<T>(key);
    if (value !== null) {
      this.l2Cache.set(key, value, 3600);
      this.l1Cache.set(key, value);
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // Set in all cache levels
    this.l1Cache.set(key, value);
    await this.l2Cache.set(key, value, ttl);
    await this.l3Cache.set(key, value, ttl * 2); // Longer TTL for database
  }
}
```

#### Cache Warming
```typescript
// services/cache/cacheWarmer.ts
export class CacheWarmer {
  async warmCache(): Promise<void> {
    console.log('Starting cache warming...');
    
    // Warm popular routes
    await this.warmPopularRoutes();
    
    // Warm station data
    await this.warmStationData();
    
    // Warm train schedules
    await this.warmTrainSchedules();
    
    console.log('Cache warming completed');
  }

  private async warmPopularRoutes(): Promise<void> {
    const popularRoutes = [
      { from: 'Mumbai', to: 'Delhi' },
      { from: 'Delhi', to: 'Bangalore' },
      { from: 'Mumbai', to: 'Chennai' },
      { from: 'Delhi', to: 'Kolkata' },
    ];

    for (const route of popularRoutes) {
      try {
        const routes = await this.routeService.searchRoutes(route);
        await this.cache.set(`routes:${route.from}:${route.to}`, routes, 3600);
      } catch (error) {
        console.error(`Failed to warm route ${route.from} to ${route.to}:`, error);
      }
    }
  }

  private async warmStationData(): Promise<void> {
    const stations = await this.stationService.getAllStations();
    
    for (const station of stations) {
      await this.cache.set(`station:${station.code}`, station, 7200);
    }
  }

  private async warmTrainSchedules(): Promise<void> {
    const trains = await this.trainService.getAllTrains();
    
    for (const train of trains) {
      const schedule = await this.trainService.getSchedule(train.id);
      await this.cache.set(`schedule:${train.id}`, schedule, 1800);
    }
  }
}
```

---

This performance architecture ensures that RailConnect India delivers optimal performance across all components, from frontend user experience to backend API responses. The comprehensive monitoring and optimization strategies help maintain high performance even under heavy load.
