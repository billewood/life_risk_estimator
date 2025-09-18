#!/usr/bin/env ts-node

/**
 * Calculation Validation Script
 * 
 * This script validates that all calculations go through the centralized
 * integrated calculator system and identifies any unauthorized calculations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ValidationResult {
  isValid: boolean;
  violations: Violation[];
  recommendations: string[];
  summary: {
    totalFiles: number;
    filesWithViolations: number;
    totalViolations: number;
    criticalViolations: number;
  };
}

interface Violation {
  file: string;
  line: number;
  type: 'direct-calculation' | 'unauthorized-import' | 'bypass-attempt' | 'deprecated-usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  code: string;
  fix: string;
}

class CalculationValidator {
  private projectRoot: string;
  private violations: Violation[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Validate all calculations in the project
   */
  async validate(): Promise<ValidationResult> {
    console.log('🔍 Validating calculation centralization...');
    
    // Find all TypeScript files
    const tsFiles = await this.findTypeScriptFiles();
    console.log(`Found ${tsFiles.length} TypeScript files to validate`);

    // Check each file for violations
    for (const file of tsFiles) {
      await this.validateFile(file);
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Calculate summary
    const summary = this.calculateSummary();

    return {
      isValid: this.violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      violations: this.violations,
      recommendations,
      summary
    };
  }

  /**
   * Find all TypeScript files in the project
   */
  private async findTypeScriptFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.next/*"', {
        cwd: this.projectRoot
      });
      
      return stdout
        .trim()
        .split('\n')
        .filter(file => file.length > 0)
        .map(file => file.replace('./', ''));
    } catch (error) {
      console.error('Error finding TypeScript files:', error);
      return [];
    }
  }

  /**
   * Validate a single file for calculation violations
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Check for direct calculation imports
        if (this.hasUnauthorizedImport(line)) {
          this.violations.push({
            file: filePath,
            line: lineNumber,
            type: 'unauthorized-import',
            severity: 'high',
            description: 'Importing calculation methods directly instead of using calculationEnforcer',
            code: line.trim(),
            fix: 'Replace with import from calculationEnforcer'
          });
        }

        // Check for direct calculation calls
        if (this.hasDirectCalculation(line)) {
          this.violations.push({
            file: filePath,
            line: lineNumber,
            type: 'direct-calculation',
            severity: 'critical',
            description: 'Direct calculation method call detected',
            code: line.trim(),
            fix: 'Use calculationEnforcer.calculateMortalityRisk() instead'
          });
        }

        // Check for bypass attempts
        if (this.hasBypassAttempt(line)) {
          this.violations.push({
            file: filePath,
            line: lineNumber,
            type: 'bypass-attempt',
            severity: 'critical',
            description: 'Attempt to bypass calculation enforcement detected',
            code: line.trim(),
            fix: 'Remove bypass attempt and use calculationEnforcer'
          });
        }

        // Check for deprecated usage
        if (this.hasDeprecatedUsage(line)) {
          this.violations.push({
            file: filePath,
            line: lineNumber,
            type: 'deprecated-usage',
            severity: 'medium',
            description: 'Using deprecated calculation method',
            code: line.trim(),
            fix: 'Update to use calculationEnforcer.calculateMortalityRisk()'
          });
        }
      }
    } catch (error) {
      console.error(`Error validating file ${filePath}:`, error);
    }
  }

  /**
   * Check if line has unauthorized imports
   */
  private hasUnauthorizedImport(line: string): boolean {
    const unauthorizedImports = [
      /from\s+['"]@\/lib\/model\/baselineMortality['"]/,
      /from\s+['"]@\/lib\/model\/lifeExpectancy['"]/,
      /from\s+['"]@\/lib\/model\/engine['"]/,
      /from\s+['"]@\/lib\/model\/survival['"]/,
      /from\s+['"]@\/lib\/model\/uncertainty['"]/,
      /from\s+['"]@\/lib\/shortterm\/engine['"]/,
      /from\s+['"]@\/lib\/model\/realEngine['"]/
    ];

    return unauthorizedImports.some(pattern => pattern.test(line));
  }

  /**
   * Check if line has direct calculation calls
   */
  private hasDirectCalculation(line: string): boolean {
    const directCalculationPatterns = [
      /getBaseline1YearRisk\s*\(/,
      /getBaselineLifeExpectancy\s*\(/,
      /getBaseRow\s*\(/,
      /sequenceFrom\s*\(/,
      /interpolateMortality\s*\(/,
      /calculateLifeExpectancy\s*\(/,
      /findMedianSurvival\s*\(/,
      /buildSurvivalCurve\s*\(/,
      /estimate\s*\(/,
      /bootstrap\s*\(/,
      /calculateConfidenceIntervals\s*\(/
    ];

    return directCalculationPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line has bypass attempts
   */
  private hasBypassAttempt(line: string): boolean {
    const bypassPatterns = [
      /\/\/\s*bypass/i,
      /\/\/\s*skip.*validation/i,
      /\/\/\s*direct.*calculation/i,
      /calculationEnforcer\.isEnabled\s*=\s*false/,
      /calculationEnforcer\.setEnabled\s*\(\s*false\s*\)/
    ];

    return bypassPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if line has deprecated usage
   */
  private hasDeprecatedUsage(line: string): boolean {
    const deprecatedPatterns = [
      /integratedCalculator\./,
      /new\s+IntegratedMortalityCalculator/,
      /calculator\.calculate/
    ];

    return deprecatedPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Generate recommendations based on violations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const criticalViolations = this.violations.filter(v => v.severity === 'critical');
    const highViolations = this.violations.filter(v => v.severity === 'high');

    if (criticalViolations.length > 0) {
      recommendations.push('🚨 CRITICAL: Fix all critical violations immediately');
      recommendations.push('   - Replace direct calculation calls with calculationEnforcer.calculateMortalityRisk()');
      recommendations.push('   - Remove all bypass attempts');
    }

    if (highViolations.length > 0) {
      recommendations.push('⚠️ HIGH: Address high-priority violations');
      recommendations.push('   - Update unauthorized imports to use calculationEnforcer');
      recommendations.push('   - Ensure all calculations go through centralized system');
    }

    if (this.violations.some(v => v.type === 'deprecated-usage')) {
      recommendations.push('📝 Update deprecated usage');
      recommendations.push('   - Replace integratedCalculator with calculationEnforcer');
      recommendations.push('   - Update all calculation method calls');
    }

    recommendations.push('✅ Best practices:');
    recommendations.push('   - Always use calculationEnforcer.calculateMortalityRisk() for calculations');
    recommendations.push('   - Include source parameter to track calculation origin');
    recommendations.push('   - Handle validation errors gracefully');
    recommendations.push('   - Log calculation requests for audit purposes');

    return recommendations;
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary() {
    const totalFiles = new Set(this.violations.map(v => v.file)).size;
    const filesWithViolations = new Set(this.violations.map(v => v.file)).size;
    const totalViolations = this.violations.length;
    const criticalViolations = this.violations.filter(v => v.severity === 'critical').length;

    return {
      totalFiles: 0, // Would need to count all files
      filesWithViolations,
      totalViolations,
      criticalViolations
    };
  }

  /**
   * Generate detailed report
   */
  generateReport(): string {
    const report = [
      '# Calculation Validation Report',
      '',
      '## Summary',
      `Total violations: ${this.violations.length}`,
      `Critical violations: ${this.violations.filter(v => v.severity === 'critical').length}`,
      `High violations: ${this.violations.filter(v => v.severity === 'high').length}`,
      `Medium violations: ${this.violations.filter(v => v.severity === 'medium').length}`,
      `Low violations: ${this.violations.filter(v => v.severity === 'low').length}`,
      '',
      '## Violations by Type',
      ''
    ];

    const violationsByType = this.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [type, count] of Object.entries(violationsByType)) {
      report.push(`- **${type}**: ${count}`);
    }

    report.push('', '## Detailed Violations', '');

    for (const violation of this.violations) {
      report.push(`### ${violation.file}:${violation.line}`);
      report.push(`**Type**: ${violation.type}`);
      report.push(`**Severity**: ${violation.severity}`);
      report.push(`**Description**: ${violation.description}`);
      report.push(`**Code**: \`${violation.code}\``);
      report.push(`**Fix**: ${violation.fix}`);
      report.push('');
    }

    return report.join('\n');
  }
}

// Main execution
async function main() {
  const projectRoot = process.cwd();
  const validator = new CalculationValidator(projectRoot);
  
  console.log('🔍 Starting calculation validation...');
  const result = await validator.validate();
  
  console.log('\n📊 Validation Results:');
  console.log(`✅ Valid: ${result.isValid}`);
  console.log(`📁 Files with violations: ${result.summary.filesWithViolations}`);
  console.log(`🚨 Total violations: ${result.summary.totalViolations}`);
  console.log(`💥 Critical violations: ${result.summary.criticalViolations}`);
  
  if (result.violations.length > 0) {
    console.log('\n⚠️ Violations found:');
    for (const violation of result.violations.slice(0, 10)) { // Show first 10
      console.log(`  ${violation.severity.toUpperCase()}: ${violation.file}:${violation.line} - ${violation.description}`);
    }
    if (result.violations.length > 10) {
      console.log(`  ... and ${result.violations.length - 10} more`);
    }
  }
  
  console.log('\n📋 Recommendations:');
  for (const recommendation of result.recommendations) {
    console.log(`  ${recommendation}`);
  }
  
  // Generate detailed report
  const report = validator.generateReport();
  fs.writeFileSync(path.join(projectRoot, 'CALCULATION_VALIDATION_REPORT.md'), report);
  console.log('\n📄 Detailed report saved to: CALCULATION_VALIDATION_REPORT.md');
  
  if (!result.isValid) {
    console.log('\n❌ Validation failed! Please fix critical and high-priority violations.');
    process.exit(1);
  } else {
    console.log('\n✅ All calculations are properly centralized!');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CalculationValidator };
