#!/usr/bin/env ts-node

/**
 * Calculation Consolidation Script
 * 
 * This script finds all calculation methods outside the integrated system
 * and either removes them or redirects them to the centralized calculator.
 */

import * as fs from 'fs';
import * as path from 'path';

interface CalculationMethod {
  file: string;
  line: number;
  method: string;
  type: 'direct' | 'wrapper' | 'utility';
  action: 'remove' | 'redirect' | 'keep';
}

class CalculationConsolidator {
  private projectRoot: string;
  private calculationMethods: CalculationMethod[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Find all calculation methods in the codebase
   */
  async findCalculationMethods(): Promise<CalculationMethod[]> {
    const methods: CalculationMethod[] = [];
    
    // Files to scan for calculations
    const filesToScan = [
      'lib/model/baselineMortality.ts',
      'lib/model/lifeExpectancy.ts',
      'lib/model/engine.ts',
      'lib/model/survival.ts',
      'lib/model/uncertainty.ts',
      'lib/shortterm/engine.ts',
      'lib/model/realEngine.ts'
    ];

    for (const file of filesToScan) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Look for calculation functions
          if (this.isCalculationFunction(line)) {
            const method = this.extractMethodName(line);
            const type = this.classifyMethod(line, file);
            const action = this.determineAction(method, type, file);
            
            methods.push({
              file,
              line: i + 1,
              method,
              type,
              action
            });
          }
        }
      }
    }

    return methods;
  }

  /**
   * Check if a line contains a calculation function
   */
  private isCalculationFunction(line: string): boolean {
    const calculationPatterns = [
      /export\s+(async\s+)?function\s+(calculate|estimate|compute|get.*Risk|get.*Life|get.*Mortality)/i,
      /export\s+(async\s+)?function\s+(getBaseline|getLife|getMortality|getRisk)/i,
      /export\s+(async\s+)?function\s+(interpolate|sequence|trend)/i,
      /export\s+(async\s+)?function\s+(bootstrap|uncertainty|confidence)/i
    ];

    return calculationPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Extract method name from function declaration
   */
  private extractMethodName(line: string): string {
    const match = line.match(/function\s+(\w+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Classify the type of calculation method
   */
  private classifyMethod(line: string, file: string): 'direct' | 'wrapper' | 'utility' {
    // Direct calculation methods that should be removed
    if (file.includes('baselineMortality') || file.includes('lifeExpectancy')) {
      return 'direct';
    }
    
    // Wrapper methods that should redirect
    if (file.includes('engine') && !file.includes('integrated')) {
      return 'wrapper';
    }
    
    // Utility methods that might be kept
    return 'utility';
  }

  /**
   * Determine what action to take with each method
   */
  private determineAction(method: string, type: 'direct' | 'wrapper' | 'utility', file: string): 'remove' | 'redirect' | 'keep' {
    // Methods that should be removed (replaced by integrated calculator)
    const methodsToRemove = [
      'getBaseline1YearRisk',
      'getBaselineLifeExpectancy',
      'getBaseRow',
      'sequenceFrom',
      'interpolateMortality',
      'getMortalityTrend',
      'calculateLifeExpectancy',
      'findMedianSurvival',
      'buildSurvivalCurve',
      'estimate',
      'getBaselineEstimate'
    ];

    if (methodsToRemove.includes(method)) {
      return 'remove';
    }

    // Wrapper methods should redirect to integrated calculator
    if (type === 'wrapper') {
      return 'redirect';
    }

    // Utility methods can be kept
    return 'keep';
  }

  /**
   * Generate consolidation report
   */
  generateReport(): string {
    const report = [
      '# Calculation Consolidation Report',
      '',
      '## Summary',
      `Total methods found: ${this.calculationMethods.length}`,
      `Methods to remove: ${this.calculationMethods.filter(m => m.action === 'remove').length}`,
      `Methods to redirect: ${this.calculationMethods.filter(m => m.action === 'redirect').length}`,
      `Methods to keep: ${this.calculationMethods.filter(m => m.action === 'keep').length}`,
      '',
      '## Methods to Remove',
      ''
    ];

    const methodsToRemove = this.calculationMethods.filter(m => m.action === 'remove');
    for (const method of methodsToRemove) {
      report.push(`- **${method.method}** in ${method.file}:${method.line}`);
    }

    report.push('', '## Methods to Redirect', '');
    const methodsToRedirect = this.calculationMethods.filter(m => m.action === 'redirect');
    for (const method of methodsToRedirect) {
      report.push(`- **${method.method}** in ${method.file}:${method.line}`);
    }

    report.push('', '## Methods to Keep', '');
    const methodsToKeep = this.calculationMethods.filter(m => m.action === 'keep');
    for (const method of methodsToKeep) {
      report.push(`- **${method.method}** in ${method.file}:${method.line}`);
    }

    return report.join('\n');
  }

  /**
   * Generate code to replace calculation methods
   */
  generateReplacementCode(): string {
    const code = [
      '// Generated replacement code for calculation consolidation',
      '',
      'import { calculationEnforcer } from \'@/lib/calculator/calculation-enforcer\';',
      '',
      '// Redirect all calculation methods to the centralized system',
      'export async function calculateMortalityRisk(inputs: any) {',
      '  return await calculationEnforcer.calculateMortalityRisk(inputs, \'legacy-redirect\');',
      '}',
      '',
      'export async function getBaselineEstimate(inputs: any) {',
      '  return await calculationEnforcer.calculateMortalityRisk(inputs, \'legacy-redirect\');',
      '}',
      '',
      '// Deprecated methods - redirect to centralized system',
      'export const getBaseline1YearRisk = calculateMortalityRisk;',
      'export const getBaselineLifeExpectancy = calculateMortalityRisk;',
      'export const estimate = calculateMortalityRisk;',
      ''
    ];

    return code.join('\n');
  }

  /**
   * Create deprecation warnings for old methods
   */
  generateDeprecationWarnings(): string {
    const warnings = [
      '// DEPRECATION WARNINGS',
      '// These methods are deprecated and will be removed in a future version.',
      '// Use calculationEnforcer.calculateMortalityRisk() instead.',
      '',
      'console.warn(\'⚠️ getBaseline1YearRisk is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.\');',
      'console.warn(\'⚠️ getBaselineLifeExpectancy is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.\');',
      'console.warn(\'⚠️ estimate is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.\');',
      ''
    ];

    return warnings.join('\n');
  }
}

// Main execution
async function main() {
  const projectRoot = process.cwd();
  const consolidator = new CalculationConsolidator(projectRoot);
  
  console.log('🔍 Scanning for calculation methods...');
  const methods = await consolidator.findCalculationMethods();
  consolidator.calculationMethods = methods;
  
  console.log(`Found ${methods.length} calculation methods`);
  
  // Generate report
  const report = consolidator.generateReport();
  fs.writeFileSync(path.join(projectRoot, 'CALCULATION_CONSOLIDATION_REPORT.md'), report);
  console.log('📄 Generated consolidation report: CALCULATION_CONSOLIDATION_REPORT.md');
  
  // Generate replacement code
  const replacementCode = consolidator.generateReplacementCode();
  fs.writeFileSync(path.join(projectRoot, 'lib/calculator/legacy-redirects.ts'), replacementCode);
  console.log('🔄 Generated legacy redirects: lib/calculator/legacy-redirects.ts');
  
  // Generate deprecation warnings
  const warnings = consolidator.generateDeprecationWarnings();
  fs.writeFileSync(path.join(projectRoot, 'lib/calculator/deprecation-warnings.ts'), warnings);
  console.log('⚠️ Generated deprecation warnings: lib/calculator/deprecation-warnings.ts');
  
  console.log('\n✅ Calculation consolidation analysis complete!');
  console.log('\nNext steps:');
  console.log('1. Review CALCULATION_CONSOLIDATION_REPORT.md');
  console.log('2. Update imports to use calculationEnforcer');
  console.log('3. Remove deprecated calculation methods');
  console.log('4. Test that all calculations go through centralized system');
}

if (require.main === module) {
  main().catch(console.error);
}

export { CalculationConsolidator };
