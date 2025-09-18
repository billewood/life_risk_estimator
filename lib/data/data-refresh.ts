/**
 * Data Refresh Utility
 * 
 * This module provides utilities for refreshing data caches
 * when new data is released or when caches become stale.
 * 
 * USAGE:
 * - Call refreshAllData() to refresh all data sources
 * - Call refreshSource(source) to refresh a specific source
 * - Call checkStaleData() to identify stale caches
 * 
 * CACHING STRATEGY:
 * - Data is cached for 30 days by default
 * - Force refresh bypasses cache expiration
 * - Cache status is tracked and reported
 */

import { ssaLifeTableLoader } from './ssa-life-tables';
import { cdcCauseDataLoader } from './cdc-cause-data';
import { gbdRiskFactorLoader } from './gbd-risk-factors';
import { dataCacheManager } from './cache-manager';

export interface RefreshResult {
  source: string;
  success: boolean;
  message: string;
  duration: number;
  itemsRefreshed: number;
}

export class DataRefreshManager {
  private static instance: DataRefreshManager;

  private constructor() {}

  static getInstance(): DataRefreshManager {
    if (!DataRefreshManager.instance) {
      DataRefreshManager.instance = new DataRefreshManager();
    }
    return DataRefreshManager.instance;
  }

  /**
   * Refresh all data sources
   */
  async refreshAllData(): Promise<RefreshResult[]> {
    console.log('Starting refresh of all data sources...');
    const results: RefreshResult[] = [];

    // Refresh SSA data
    const ssaResult = await this.refreshSource('ssa');
    results.push(ssaResult);

    // Refresh CDC data
    const cdcResult = await this.refreshSource('cdc');
    results.push(cdcResult);

    // Refresh GBD data
    const gbdResult = await this.refreshSource('gbd');
    results.push(gbdResult);

    console.log('All data sources refreshed:', results);
    return results;
  }

  /**
   * Refresh a specific data source
   */
  async refreshSource(source: string): Promise<RefreshResult> {
    const startTime = Date.now();
    
    try {
      let itemsRefreshed = 0;
      let message = '';

      switch (source.toLowerCase()) {
        case 'ssa':
          console.log('Refreshing SSA data...');
          await ssaLifeTableLoader.forceRefresh(2024);
          const ssaStatus = ssaLifeTableLoader.getCacheStatus();
          itemsRefreshed = ssaStatus.totalCachedItems;
          message = `SSA data refreshed: ${itemsRefreshed} items`;
          break;

        case 'cdc':
          console.log('Refreshing CDC data...');
          await cdcCauseDataLoader.forceRefresh(2022);
          const cdcStatus = cdcCauseDataLoader.getCacheStatus();
          itemsRefreshed = cdcStatus.totalCachedItems;
          message = `CDC data refreshed: ${itemsRefreshed} items`;
          break;

        case 'gbd':
          console.log('Refreshing GBD data...');
          // GBD data doesn't have year-based caching, so we'll just reload
          await gbdRiskFactorLoader.loadRiskFactors(2021);
          const gbdStatus = gbdRiskFactorLoader.getCacheStatus();
          itemsRefreshed = gbdStatus.totalCachedItems;
          message = `GBD data refreshed: ${itemsRefreshed} items`;
          break;

        default:
          throw new Error(`Unknown data source: ${source}`);
      }

      const duration = Date.now() - startTime;
      console.log(`Successfully refreshed ${source} data in ${duration}ms`);

      return {
        source,
        success: true,
        message,
        duration,
        itemsRefreshed
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = `Failed to refresh ${source} data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(message);

      return {
        source,
        success: false,
        message,
        duration,
        itemsRefreshed: 0
      };
    }
  }

  /**
   * Check for stale data and return recommendations
   */
  async checkStaleData(): Promise<{
    staleCaches: {source: string, year: number, ageInDays: number}[];
    recommendations: string[];
    shouldRefresh: boolean;
  }> {
    const staleCaches = dataCacheManager.getStaleCaches();
    const healthReport = dataCacheManager.getCacheHealthReport();
    
    const recommendations: string[] = [];
    
    if (staleCaches.length > 0) {
      recommendations.push(`Found ${staleCaches.length} stale cache(s) that should be refreshed`);
      
      staleCaches.forEach(cache => {
        recommendations.push(`${cache.source} data for ${cache.year} is ${cache.ageInDays} days old`);
      });
      
      if (staleCaches.length > 2) {
        recommendations.push('Consider implementing automated cache refresh scheduling');
      }
    } else {
      recommendations.push('All data caches are fresh and up-to-date');
    }

    return {
      staleCaches,
      recommendations,
      shouldRefresh: staleCaches.length > 0
    };
  }

  /**
   * Get cache health summary
   */
  getCacheHealthSummary(): {
    summary: {
      totalSources: number;
      totalCachedItems: number;
      staleCaches: number;
      averageCacheAge: number;
    };
    health: {
      status: 'healthy' | 'warning' | 'critical';
      message: string;
      recommendations: string[];
    };
  } {
    const summary = dataCacheManager.getCacheSummary();
    const health = dataCacheManager.getCacheHealthReport();

    return {
      summary,
      health
    };
  }

  /**
   * Clear all caches (use with caution)
   */
  async clearAllCaches(): Promise<void> {
    console.log('Clearing all data caches...');
    
    ssaLifeTableLoader.clearCache();
    cdcCauseDataLoader.clearCache();
    gbdRiskFactorLoader.clearCache();
    dataCacheManager.clearAllCaches();
    
    console.log('All data caches cleared');
  }

  /**
   * Get data source information
   */
  getDataSourceInfo(): {
    ssa: ReturnType<typeof ssaLifeTableLoader.getDataSourceInfo>;
    cdc: ReturnType<typeof cdcCauseDataLoader.getDataSourceInfo>;
    gbd: ReturnType<typeof gbdRiskFactorLoader.getDataSourceInfo>;
  } {
    return {
      ssa: ssaLifeTableLoader.getDataSourceInfo(),
      cdc: cdcCauseDataLoader.getDataSourceInfo(),
      gbd: gbdRiskFactorLoader.getDataSourceInfo()
    };
  }
}

export const dataRefreshManager = DataRefreshManager.getInstance();
