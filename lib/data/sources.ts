/**
 * Real data sources for mortality and risk factor data
 * 
 * This file defines the data sources we'll use and provides
 * utilities for fetching and processing real data.
 */

export interface DataSource {
  name: string;
  url: string;
  description: string;
  format: 'csv' | 'json' | 'api' | 'pdf';
  updateFrequency: 'annual' | 'quarterly' | 'monthly';
  lastUpdated?: string;
}

export const DATA_SOURCES: Record<string, DataSource> = {
  // CDC WONDER - US Mortality Data
  cdcWonder: {
    name: 'CDC WONDER Mortality Data',
    url: 'https://wonder.cdc.gov/controller/datarequest/D140',
    description: 'Official US mortality data by age, sex, and cause',
    format: 'api',
    updateFrequency: 'annual',
    lastUpdated: '2024-01-01'
  },

  // CDC Life Tables
  cdcLifeTables: {
    name: 'CDC Life Tables',
    url: 'https://www.cdc.gov/nchs/data/nvsr/nvsr72/nvsr72-10-tables-508.pdf',
    description: 'US Life Tables by age and sex',
    format: 'pdf',
    updateFrequency: 'annual',
    lastUpdated: '2023-12-01'
  },

  // WHO Global Health Observatory
  whoMortality: {
    name: 'WHO Global Health Observatory',
    url: 'https://apps.who.int/gho/data/node.main.1',
    description: 'Global mortality and health data',
    format: 'api',
    updateFrequency: 'annual',
    lastUpdated: '2024-01-01'
  },

  // Global Burden of Disease Study
  gbd: {
    name: 'Global Burden of Disease Study',
    url: 'https://ghdx.healthdata.org/gbd-results-tool',
    description: 'Comprehensive global health data including risk factors',
    format: 'api',
    updateFrequency: 'annual',
    lastUpdated: '2023-12-01'
  },

  // NHANES - National Health and Nutrition Examination Survey
  nhanes: {
    name: 'NHANES',
    url: 'https://www.cdc.gov/nchs/nhanes/index.htm',
    description: 'US health and nutrition survey data',
    format: 'api',
    updateFrequency: 'annual',
    lastUpdated: '2024-01-01'
  }
};

/**
 * Risk factor data sources from published research
 */
export const RISK_FACTOR_SOURCES = {
  smoking: {
    source: 'US Surgeon General Report 2014',
    url: 'https://www.hhs.gov/surgeongeneral/reports-and-publications/tobacco/2014-annual-report/index.html',
    hazardRatios: {
      current: 2.1,
      former: 1.3,
      never: 1.0
    }
  },
  
  alcohol: {
    source: 'Global Burden of Disease Study 2019',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)31310-2/fulltext',
    hazardRatios: {
      none: 1.0,
      light: 0.95,
      moderate: 1.0,
      heavy: 1.4
    }
  },

  physicalActivity: {
    source: 'Physical Activity Guidelines for Americans, 2nd Edition',
    url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines',
    hazardRatios: {
      sedentary: 1.3,
      low: 1.1,
      moderate: 0.9,
      high: 0.8
    }
  }
};

/**
 * Data fetching utilities
 */
export class DataFetcher {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  async fetchData<T>(source: DataSource, params?: Record<string, string>): Promise<T> {
    const cacheKey = `${source.name}-${JSON.stringify(params || {})}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let data: T;
      
      switch (source.format) {
        case 'api':
          data = await this.fetchFromAPI(source.url, params);
          break;
        case 'csv':
          data = await this.fetchCSV(source.url);
          break;
        case 'json':
          data = await this.fetchJSON(source.url);
          break;
        default:
          throw new Error(`Unsupported format: ${source.format}`);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Failed to fetch data from ${source.name}:`, error);
      throw error;
    }
  }

  private async fetchFromAPI(url: string, params?: Record<string, string>): Promise<any> {
    const searchParams = new URLSearchParams(params);
    const fullUrl = `${url}?${searchParams.toString()}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LifeRiskEstimator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchCSV(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return this.parseCSV(csvText);
  }

  private async fetchJSON(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const dataFetcher = new DataFetcher();
