#!/usr/bin/env python3
"""
Test script to demonstrate risk factor schema functionality
"""

import sys
sys.path.append('/Users/williamwood/Code/mortality_calculator')

from api.risk_factor_schema import risk_factor_schema
import json

def main():
    print("🎯 RISK FACTOR SCHEMA DEMONSTRATION")
    print("=" * 50)
    
    # Get the complete schema
    schema = risk_factor_schema.get_schema()
    
    print("\n📋 REQUIRED FIELDS:")
    print("-" * 20)
    required = schema["required_fields"]
    for field, spec in required.items():
        print(f"• {field}: {spec['type']} - {spec['description']}")
        print(f"  Range: {spec.get('min', 'N/A')}-{spec.get('max', 'N/A')}")
        print(f"  Options: {spec.get('enum', 'Any')}")
        print()
    
    print("🔬 RISK FACTORS:")
    print("-" * 15)
    risk_factors = schema["risk_factors"]
    for field, spec in risk_factors.items():
        print(f"• {field}: {spec['type']}")
        print(f"  Description: {spec['description']}")
        if "enum" in spec:
            print(f"  Options: {spec['enum']}")
        if "min" in spec and "max" in spec:
            print(f"  Range: {spec['min']}-{spec['max']}")
        if "default" in spec:
            print(f"  Default: {spec['default']}")
        print()
    
    print("🧪 VALIDATION EXAMPLES:")
    print("-" * 25)
    
    # Test valid data
    valid_data = {
        "age": 65,
        "sex": "male",
        "race": "white",
        "smoking_status": "current",
        "systolic_bp": 140,
        "bp_treated": False,
        "bmi": 28,
        "fitness_level": "sedentary",
        "alcohol_pattern": "heavy",
        "diabetes": False,
        "total_cholesterol": 220,
        "hdl_cholesterol": 40
    }
    
    print("✅ Valid data example:")
    validation = risk_factor_schema.validate_risk_factors(valid_data)
    print(f"   Valid: {validation['valid']}")
    print(f"   Errors: {len(validation['errors'])}")
    print(f"   Warnings: {len(validation['warnings'])}")
    
    # Test invalid data
    invalid_data = {
        "age": 150,  # Too high
        "sex": "other",  # Invalid option
        "smoking_status": "heavy",  # Invalid option
        "systolic_bp": 300,  # Too high
        "bmi": -5  # Too low
    }
    
    print("\n❌ Invalid data example:")
    validation = risk_factor_schema.validate_risk_factors(invalid_data)
    print(f"   Valid: {validation['valid']}")
    print(f"   Errors: {len(validation['errors'])}")
    for error in validation['errors']:
        print(f"     - {error}")
    
    print("\n🎨 FRONTEND GUIDANCE:")
    print("-" * 20)
    guidance = schema["frontend_guidance"]
    
    print("Form sections:")
    for section in guidance["form_organization"]["sections"]:
        print(f"• {section['title']}: {', '.join(section['fields'])}")
        print(f"  {section['description']}")
    
    print("\nUI recommendations:")
    ui_recs = guidance["ui_recommendations"]
    for field, input_type in ui_recs["input_types"].items():
        print(f"• {field}: {input_type}")
    
    print("\n📡 API EXAMPLE:")
    print("-" * 15)
    api_example = schema["api_format"]["request_example"]
    print("Request format:")
    print(json.dumps(api_example, indent=2))
    
    print("\n✅ SCHEMA READY FOR FRONTEND INTEGRATION")
    print("=" * 50)
    print("The frontend can now:")
    print("• Use /api/schema to get complete field specifications")
    print("• Use /api/schema/validation to validate user input")
    print("• Build forms with proper validation and UI hints")
    print("• Handle all risk factors with correct types and ranges")

if __name__ == "__main__":
    main()
