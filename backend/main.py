"""
Main entry point for the Mortality Calculator
ONLY works with real data - no placeholder or fake data allowed
"""

import sys
import os
sys.path.append('/Users/williamwood/Code/mortality_calculator')

from data_sources.data_acquisition import DataAcquisition
from calculators.mortality_calculator import MortalityCalculator
from data_logger import data_logger

def main():
    print("Mortality Risk Calculator")
    print("=" * 50)
    print("WARNING: This calculator ONLY works with real data.")
    print("No placeholder or fake data will be used.")
    print("=" * 50)
    
    # Initialize data management
    print("Checking data sources...")
    from data_sources.data_manager import DataManager
    data_manager = DataManager()
    
    # Show current data status
    data_manager.print_data_status()
    
    # Initialize data acquisition for any missing data
    print("\nInitializing data sources...")
    acquirer = DataAcquisition()
    
    # Check if we need to download SSA data
    status = data_manager.get_data_status()
    if not status['ssa_life_tables']['available']:
        print("Downloading SSA life tables...")
        try:
            ssa_data = acquirer.download_ssa_life_tables()
            print("✓ SSA life tables downloaded successfully")
        except Exception as e:
            print(f"✗ Error downloading SSA data: {e}")
            return
    else:
        print("✓ SSA data available (using cached data)")
    
    # Note about other data sources
    if not status['cdc_cause_data']['available']:
        print("⚠ CDC cause data not available - using simplified allocation")
    
    if not status['gbd_risk_factors']['available']:
        print("⚠ GBD risk factors not available - using literature-based estimates")
    
    # Initialize calculator
    print("Initializing mortality calculator...")
    try:
        calculator = MortalityCalculator()
        print("✓ Calculator initialized successfully with real data")
    except Exception as e:
        print(f"✗ Error initializing calculator: {e}")
        print("Calculator requires real data to function.")
        return
    
    # Example calculation would go here
    print("\nExample Risk Calculation:")
    print("-" * 30)
    print("This would calculate risk using real data once data sources are implemented.")
    print("No example calculations until real data is available.")
    
    # Show data usage report
    print(f"\nData Usage Report:")
    print("-" * 20)
    try:
        usage_report = data_logger.get_usage_report()
        for entry in usage_report:
            print(f"Source: {entry['source_name']}")
            print(f"  Usage: {entry['usage_context']}")
            print(f"  Calculation: {entry['calculation_type']}")
            print(f"  Timestamp: {entry['usage_timestamp']}")
            print()
    except Exception as e:
        print(f"Error retrieving usage report: {e}")

if __name__ == "__main__":
    main()
