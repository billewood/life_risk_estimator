#!/usr/bin/env python3
"""
Test script for the Mortality Calculator
ONLY works with real data - no placeholder or fake data allowed
"""

import sys
import os
# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_data_logger():
    """Test the data logger functionality"""
    print("Testing data logger...")
    
    from data_logger import data_logger
    
    # Test source registration
    source_id = data_logger.register_source(
        source_name="Test Source",
        source_type="test",
        url="https://example.com",
        description="Test data source",
        version="1.0"
    )
    print(f"✓ Source registered with ID: {source_id}")
    
    # Test data import logging
    test_data = {"test": "data", "value": 123}
    data_hash = data_logger.get_data_hash(test_data)
    import_id = data_logger.log_import(
        source_id=source_id,
        file_path="/tmp/test.csv",
        data_hash=data_hash,
        record_count=1,
        import_notes="Test import"
    )
    print(f"✓ Import logged with ID: {import_id}")
    
    # Test usage logging
    data_logger.log_usage(
        import_id=import_id,
        usage_context="test_calculation",
        data_subset="test_data",
        calculation_type="test",
        result_summary="Test result"
    )
    print("✓ Usage logged successfully")
    
    return True

def test_data_acquisition():
    """Test the data acquisition module"""
    print("\nTesting data acquisition...")
    
    from data_sources.data_acquisition import DataAcquisition
    
    acquirer = DataAcquisition()
    
    # Test downloading all sources
    try:
        data = acquirer.download_all_sources()
        print("✓ All real data sources downloaded successfully")
        return True
    except Exception as e:
        print(f"✗ Error in data acquisition: {e}")
        print("This is expected until real data download methods are implemented.")
        return False

def test_mortality_models():
    """Test the mortality models"""
    print("\nTesting mortality models...")
    
    from models.mortality_models import MortalityModels
    
    try:
        models = MortalityModels()
        print("✓ Mortality models initialized with real data")
        return True
    except Exception as e:
        print(f"✗ Error in mortality models: {e}")
        print("This is expected until real data is available.")
        return False

def test_calculator():
    """Test the main calculator"""
    print("\nTesting mortality calculator...")
    
    from calculators.mortality_calculator import MortalityCalculator
    
    try:
        calculator = MortalityCalculator()
        print("✓ Calculator initialized with real data")
        return True
    except Exception as e:
        print(f"✗ Error in calculator: {e}")
        print("This is expected until real data is available.")
        return False

def main():
    """Run all tests"""
    print("Mortality Calculator Test Suite")
    print("=" * 40)
    print("WARNING: This calculator ONLY works with real data.")
    print("No placeholder or fake data will be used.")
    print("=" * 40)
    
    tests = [
        test_data_logger,
        test_data_acquisition,
        test_mortality_models,
        test_calculator
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
    
    print(f"\nTest Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✓ All tests passed! Calculator is ready to use with real data.")
        return True
    else:
        print("✗ Some tests failed. This is expected until real data is available.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
