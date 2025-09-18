/**
 * Data Versioning and Change Detection System
 * 
 * This module tracks data versions, detects changes, and ensures
 * our calculations stay aligned with source data updates.
 */

export interface DataVersion {
  source: string;
  version: string;
  lastModified: string;
  dataHash: string;
  keyMetrics: {
    [key: string]: number;
  };
  sampleData: {
    [key: string]: any;
  };
  url: string;
  checksum: string;
}

export interface ChangeDetection {
  source: string;
  hasChanges: boolean;
  changes: DataChange[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  requiresRecalculation: boolean;
  detectedAt: string;
}

export interface DataChange {
  type: 'addition' | 'modification' | 'deletion';
  field: string;
  oldValue?: any;
  newValue?: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedMetrics: string[];
}

export class DataVersioningSystem {
  private versions: Map<string, DataVersion> = new Map();
  private changeHistory: ChangeDetection[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Register a data source version
   */
  registerVersion(version: DataVersion): void {
    this.versions.set(version.source, version);
    console.log(`Registered version ${version.version} for ${version.source}`);
  }

  /**
   * Check for changes in a data source
   */
  async checkForChanges(source: string): Promise<ChangeDetection> {
    const currentVersion = this.versions.get(source);
    if (!currentVersion) {
      throw new Error(`No version registered for source: ${source}`);
    }

    // In a real implementation, this would fetch the latest data
    const latestData = await this.fetchLatestData(source);
    const changes = this.detectChanges(currentVersion, latestData);
    
    const changeDetection: ChangeDetection = {
      source,
      hasChanges: changes.length > 0,
      changes,
      severity: this.calculateSeverity(changes),
      requiresRecalculation: this.requiresRecalculation(changes),
      detectedAt: new Date().toISOString()
    };

    this.changeHistory.push(changeDetection);
    return changeDetection;
  }

  /**
   * Fetch latest data from source (simulated)
   */
  private async fetchLatestData(source: string): Promise<DataVersion> {
    // In real implementation, this would fetch actual data
    // For now, we'll simulate data fetching with some random changes
    const currentVersion = this.versions.get(source);
    if (!currentVersion) {
      throw new Error(`No version registered for source: ${source}`);
    }

    // Simulate some changes (in real implementation, this would be actual data)
    const hasChanges = Math.random() > 0.7; // 30% chance of changes
    
    if (!hasChanges) {
      return currentVersion;
    }

    // Simulate changes
    const newVersion = { ...currentVersion };
    newVersion.version = this.incrementVersion(currentVersion.version);
    newVersion.lastModified = new Date().toISOString();
    newVersion.dataHash = this.generateHash();
    newVersion.checksum = this.generateChecksum();

    // Simulate metric changes
    const metricChanges = ['mortality-rate-30', 'mortality-rate-50', 'mortality-rate-70'];
    for (const metric of metricChanges) {
      if (Math.random() > 0.5) {
        const currentValue = newVersion.keyMetrics[metric] || 0.001;
        const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
        newVersion.keyMetrics[metric] = currentValue * (1 + changePercent);
      }
    }

    return newVersion;
  }

  /**
   * Detect changes between versions
   */
  private detectChanges(oldVersion: DataVersion, newVersion: DataVersion): DataChange[] {
    const changes: DataChange[] = [];

    // Check version changes
    if (oldVersion.version !== newVersion.version) {
      changes.push({
        type: 'modification',
        field: 'version',
        oldValue: oldVersion.version,
        newValue: newVersion.version,
        impact: 'low',
        affectedMetrics: []
      });
    }

    // Check data hash changes
    if (oldVersion.dataHash !== newVersion.dataHash) {
      changes.push({
        type: 'modification',
        field: 'dataHash',
        oldValue: oldVersion.dataHash,
        newValue: newVersion.dataHash,
        impact: 'high',
        affectedMetrics: ['all']
      });
    }

    // Check key metrics changes
    for (const [metric, newValue] of Object.entries(newVersion.keyMetrics)) {
      const oldValue = oldVersion.keyMetrics[metric];
      if (oldValue !== undefined && Math.abs(oldValue - newValue) > oldValue * 0.01) { // 1% threshold
        changes.push({
          type: 'modification',
          field: `keyMetrics.${metric}`,
          oldValue,
          newValue,
          impact: this.calculateMetricImpact(metric, oldValue, newValue),
          affectedMetrics: [metric]
        });
      }
    }

    // Check for new metrics
    for (const [metric, value] of Object.entries(newVersion.keyMetrics)) {
      if (!(metric in oldVersion.keyMetrics)) {
        changes.push({
          type: 'addition',
          field: `keyMetrics.${metric}`,
          newValue: value,
          impact: 'medium',
          affectedMetrics: [metric]
        });
      }
    }

    // Check for removed metrics
    for (const metric of Object.keys(oldVersion.keyMetrics)) {
      if (!(metric in newVersion.keyMetrics)) {
        changes.push({
          type: 'deletion',
          field: `keyMetrics.${metric}`,
          oldValue: oldVersion.keyMetrics[metric],
          impact: 'high',
          affectedMetrics: [metric]
        });
      }
    }

    return changes;
  }

  /**
   * Calculate change severity
   */
  private calculateSeverity(changes: DataChange[]): 'low' | 'medium' | 'high' | 'critical' {
    if (changes.length === 0) return 'low';
    
    const criticalChanges = changes.filter(c => c.impact === 'critical').length;
    const highChanges = changes.filter(c => c.impact === 'high').length;
    const mediumChanges = changes.filter(c => c.impact === 'medium').length;

    if (criticalChanges > 0) return 'critical';
    if (highChanges > 2) return 'high';
    if (highChanges > 0 || mediumChanges > 3) return 'medium';
    return 'low';
  }

  /**
   * Determine if recalculation is required
   */
  private requiresRecalculation(changes: DataChange[]): boolean {
    return changes.some(change => 
      change.impact === 'critical' || 
      change.impact === 'high' ||
      change.affectedMetrics.includes('all')
    );
  }

  /**
   * Calculate metric impact
   */
  private calculateMetricImpact(metric: string, oldValue: number, newValue: number): 'low' | 'medium' | 'high' | 'critical' {
    const changePercent = Math.abs((newValue - oldValue) / oldValue);
    
    if (changePercent > 0.5) return 'critical'; // >50% change
    if (changePercent > 0.2) return 'high';     // >20% change
    if (changePercent > 0.05) return 'medium';  // >5% change
    return 'low';
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]) || 0;
    const minor = parseInt(parts[1]) || 0;
    const patch = parseInt(parts[2]) || 0;
    
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Generate data hash
   */
  private generateHash(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate checksum
   */
  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Start monitoring for changes
   */
  startMonitoring(intervalMinutes: number = 60): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      console.log('Checking for data changes...');
      
      for (const source of this.versions.keys()) {
        try {
          const changeDetection = await this.checkForChanges(source);
          if (changeDetection.hasChanges) {
            console.log(`Changes detected in ${source}:`, changeDetection);
            this.handleDataChanges(changeDetection);
          }
        } catch (error) {
          console.error(`Error checking changes for ${source}:`, error);
        }
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Started monitoring for data changes every ${intervalMinutes} minutes`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Stopped monitoring for data changes');
    }
  }

  /**
   * Handle detected data changes
   */
  private handleDataChanges(changeDetection: ChangeDetection): void {
    if (changeDetection.requiresRecalculation) {
      console.log(`🔄 Recalculation required for ${changeDetection.source}`);
      this.triggerRecalculation(changeDetection);
    }

    if (changeDetection.severity === 'critical' || changeDetection.severity === 'high') {
      console.log(`🚨 High priority changes detected in ${changeDetection.source}`);
      this.sendAlert(changeDetection);
    }
  }

  /**
   * Trigger recalculation
   */
  private triggerRecalculation(changeDetection: ChangeDetection): void {
    // In real implementation, this would trigger a recalculation process
    console.log(`Triggering recalculation for ${changeDetection.source}...`);
    
    // This could involve:
    // 1. Updating cached data
    // 2. Recalculating all dependent metrics
    // 3. Updating the transparency database
    // 4. Notifying users of updated estimates
  }

  /**
   * Send alert for critical changes
   */
  private sendAlert(changeDetection: ChangeDetection): void {
    // In real implementation, this would send actual alerts
    console.log(`🚨 ALERT: Critical changes in ${changeDetection.source}`);
    console.log(`Changes:`, changeDetection.changes);
    
    // This could involve:
    // 1. Email notifications
    // 2. Slack/Discord alerts
    // 3. Dashboard updates
    // 4. Logging to monitoring systems
  }

  /**
   * Get change history
   */
  getChangeHistory(): ChangeDetection[] {
    return this.changeHistory;
  }

  /**
   * Get current versions
   */
  getCurrentVersions(): DataVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Get version for specific source
   */
  getVersion(source: string): DataVersion | undefined {
    return this.versions.get(source);
  }
}

export const dataVersioningSystem = new DataVersioningSystem();
