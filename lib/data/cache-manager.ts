/**
 * Data Cache Manager
 * 
 * This module manages caching for all data sources to ensure
 * efficient data loading and avoid repeated API calls.
 * 
 * CACHING STRATEGY:
 * - Data is cached for 30 days by default
 * - Cache can be force refreshed when new data is released
 * - Cache status is tracked and reported
 * - Memory-based caching (in production, could use Redis or similar)
 */

export interface CacheStatus {
  source: string;
  cachedYears: number[];
  cacheAges: {[year: number]: number};
  totalCachedItems: number;
  lastRefresh: number;
}

export class DataCacheManager {
  private static instance: DataCacheManager;
  private cacheStatus: Map<string, CacheStatus> = new Map();

  private constructor() {}

  static getInstance(): DataCacheManager {
    if (!DataCacheManager.instance) {
      DataCacheManager.instance = new DataCacheManager();
    }
    return DataCacheManager.instance;
  }

  /**
   * Register a data source with its cache status
   */
  registerSource(source: string, status: CacheStatus): void {
    this.cacheStatus.set(source, status);
  }

  /**
   * Get cache status for all sources
   */
  getAllCacheStatus(): CacheStatus[] {
    return Array.from(this.cacheStatus.values());
  }

  /**
   * Get cache status for a specific source
   */
  getSourceCacheStatus(source: string): CacheStatus | undefined {
    return this.cacheStatus.get(source);
  }

  /**
   * Check if any caches need refreshing (older than 30 days)
   */
  getStaleCaches(): {source: string, year: number, ageInDays: number}[] {
    const staleCaches: {source: string, year: number, ageInDays: number}[] = [];
    const now = Date.now();
    const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

    this.cacheStatus.forEach((status, source) => {
      Object.entries(status.cacheAges).forEach(([year, ageInDays]) => {
        const ageInMs = ageInDays * 24 * 60 * 60 * 1000;
        if (ageInMs > staleThreshold) {
          staleCaches.push({
            source,
            year: parseInt(year),
            ageInDays
          });
        }
      });
    });

    return staleCaches;
  }

  /**
   * Get cache summary statistics
   */
  getCacheSummary(): {
    totalSources: number;
    totalCachedItems: number;
    staleCaches: number;
    averageCacheAge: number;
  } {
    const allStatuses = this.getAllCacheStatus();
    const totalSources = allStatuses.length;
    const totalCachedItems = allStatuses.reduce((sum, status) => sum + status.totalCachedItems, 0);
    const staleCaches = this.getStaleCaches().length;
    
    // Calculate average cache age
    let totalAge = 0;
    let totalItems = 0;
    allStatuses.forEach(status => {
      Object.values(status.cacheAges).forEach(age => {
        totalAge += age;
        totalItems++;
      });
    });
    const averageCacheAge = totalItems > 0 ? Math.round(totalAge / totalItems) : 0;

    return {
      totalSources,
      totalCachedItems,
      staleCaches,
      averageCacheAge
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cacheStatus.clear();
    console.log('All data caches cleared');
  }

  /**
   * Get cache health report
   */
  getCacheHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    recommendations: string[];
  } {
    const summary = this.getCacheSummary();
    const staleCaches = this.getStaleCaches();

    if (staleCaches.length === 0) {
      return {
        status: 'healthy',
        message: 'All caches are fresh and up-to-date',
        recommendations: []
      };
    } else if (staleCaches.length <= 2) {
      return {
        status: 'warning',
        message: `${staleCaches.length} cache(s) are stale and should be refreshed`,
        recommendations: [
          'Consider refreshing stale caches during low-traffic periods',
          'Monitor cache ages to ensure data freshness'
        ]
      };
    } else {
      return {
        status: 'critical',
        message: `${staleCaches.length} cache(s) are stale and need immediate attention`,
        recommendations: [
          'Immediately refresh all stale caches',
          'Consider reducing cache duration for frequently updated data',
          'Implement automated cache refresh scheduling'
        ]
      };
    }
  }
}

export const dataCacheManager = DataCacheManager.getInstance();
