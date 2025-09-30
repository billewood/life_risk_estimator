"""
Risk Factor Schema for Frontend Integration
Provides complete specification of risk factors, their types, ranges, and validation rules
"""

from typing import Dict, Any, List, Union
from enum import Enum

class RiskFactorSchema:
    """
    Complete schema for risk factors that the frontend can use for form validation,
    UI generation, and data formatting.
    """
    
    def __init__(self):
        self.schema = {
            "metadata": {
                "version": "1.0",
                "description": "Complete risk factor schema for mortality calculator frontend",
                "last_updated": "2024-01-15",
                "source": "Evidence-based mortality risk calculator"
            },
            
            "required_fields": {
                "age": {
                    "type": "integer",
                    "min": 18,
                    "max": 120,
                    "description": "Age in years",
                    "required": True,
                    "examples": [25, 45, 65, 80],
                    "validation": "Must be between 18 and 120 years",
                    "frontend_hint": "Number input with min/max validation"
                },
                "sex": {
                    "type": "string",
                    "enum": ["male", "female"],
                    "description": "Biological sex",
                    "required": True,
                    "examples": ["male", "female"],
                    "validation": "Must be exactly 'male' or 'female'",
                    "frontend_hint": "Radio buttons or dropdown"
                },
                "race": {
                    "type": "string",
                    "enum": ["white", "black", "african_american", "other"],
                    "description": "Race/ethnicity for PCE calculations",
                    "required": True,
                    "default": "white",
                    "examples": ["white", "black", "african_american"],
                    "validation": "Must be one of the specified values",
                    "frontend_hint": "Dropdown with 'Other' option",
                    "note": "PCE uses 'white' and 'black' categories. 'other' maps to 'white' coefficients."
                }
            },
            
            "risk_factors": {
                "smoking_status": {
                    "type": "string",
                    "enum": ["never", "former", "current"],
                    "description": "Current smoking status",
                    "required": False,
                    "default": "never",
                    "examples": ["never", "former", "current"],
                    "validation": "Must be one of the specified values",
                    "frontend_hint": "Radio buttons with clear labels",
                    "impact": {
                        "never": "Baseline risk (1.0x)",
                        "former": "Slightly elevated (1.2x), decreases over time",
                        "current": "Significantly elevated (2.3x for U.S. population)"
                    },
                    "source": "Jha et al. 2013 - U.S. specific estimates"
                },
                
                "years_since_quit": {
                    "type": "integer",
                    "min": 0,
                    "max": 50,
                    "description": "Years since quitting smoking (for former smokers)",
                    "required": False,
                    "default": 0,
                    "conditional": "Only required if smoking_status is 'former'",
                    "examples": [1, 5, 10, 15],
                    "validation": "Must be 0-50 years",
                    "frontend_hint": "Number input, show only for former smokers",
                    "impact": "Risk decreases over 15 years to never-smoker levels",
                    "source": "Jha et al. 2013 - U.S. specific estimates"
                },
                
                "systolic_bp": {
                    "type": "number",
                    "min": 80,
                    "max": 250,
                    "description": "Systolic blood pressure in mmHg",
                    "required": False,
                    "default": 120,
                    "examples": [110, 130, 140, 160],
                    "validation": "Must be between 80-250 mmHg",
                    "frontend_hint": "Number input with mmHg label",
                    "impact": "Risk increases 1.8x per 20mmHg above 120",
                    "source": "Lewington et al. 2002 - Lancet meta-analysis"
                },
                
                "bp_treated": {
                    "type": "boolean",
                    "description": "Whether blood pressure is being treated with medication",
                    "required": False,
                    "default": False,
                    "examples": [True, False],
                    "validation": "Must be true or false",
                    "frontend_hint": "Checkbox or toggle",
                    "impact": "Treatment reduces risk by ~25%",
                    "source": "Blood pressure treatment meta-analyses"
                },
                
                "bmi": {
                    "type": "number",
                    "min": 15,
                    "max": 60,
                    "description": "Body Mass Index (kg/m²)",
                    "required": False,
                    "default": 22,
                    "examples": [18.5, 22, 25, 30, 35],
                    "validation": "Must be between 15-60 kg/m²",
                    "frontend_hint": "Number input with BMI calculator option",
                    "impact": "Optimal at 22, risk increases 1.15x per 5 units deviation",
                    "source": "Global BMI Collaboration 2016"
                },
                
                "fitness_level": {
                    "type": "string",
                    "enum": ["sedentary", "moderate", "high"],
                    "description": "Physical activity level",
                    "required": False,
                    "default": "moderate",
                    "examples": ["sedentary", "moderate", "high"],
                    "validation": "Must be one of the specified values",
                    "frontend_hint": "Radio buttons with descriptions",
                    "impact": {
                        "sedentary": "1.4x higher risk",
                        "moderate": "Baseline risk (1.0x)",
                        "high": "0.8x lower risk"
                    },
                    "source": "Kodama et al. 2009 - JAMA meta-analysis"
                },
                
                "alcohol_pattern": {
                    "type": "string",
                    "enum": ["none", "moderate", "heavy", "binge"],
                    "description": "Alcohol consumption pattern",
                    "required": False,
                    "default": "none",
                    "examples": ["none", "moderate", "heavy", "binge"],
                    "validation": "Must be one of the specified values",
                    "frontend_hint": "Radio buttons with clear definitions",
                    "impact": {
                        "none": "Baseline risk (1.0x)",
                        "moderate": "0.9x lower risk (J-shaped curve)",
                        "heavy": "1.3x higher risk",
                        "binge": "1.4x higher risk"
                    },
                    "source": "Di Castelnuovo et al. 2006 - JAMA meta-analysis"
                },
                
                "diabetes": {
                    "type": "boolean",
                    "description": "Diagnosed diabetes (type 1 or 2)",
                    "required": False,
                    "default": False,
                    "examples": [True, False],
                    "validation": "Must be true or false",
                    "frontend_hint": "Checkbox with medical diagnosis emphasis",
                    "impact": "2.5x higher risk for all-cause mortality",
                    "source": "Multiple diabetes mortality studies"
                },
                
                "total_cholesterol": {
                    "type": "number",
                    "min": 100,
                    "max": 500,
                    "description": "Total cholesterol in mg/dL",
                    "required": False,
                    "default": 200,
                    "examples": [150, 200, 250, 300],
                    "validation": "Must be between 100-500 mg/dL",
                    "frontend_hint": "Number input with mg/dL label",
                    "impact": "Used in PCE cardiovascular risk calculation",
                    "source": "PCE coefficients from Goff et al. 2013"
                },
                
                "hdl_cholesterol": {
                    "type": "number",
                    "min": 20,
                    "max": 150,
                    "description": "HDL cholesterol in mg/dL",
                    "required": False,
                    "default": 50,
                    "examples": [30, 40, 50, 60, 80],
                    "validation": "Must be between 20-150 mg/dL",
                    "frontend_hint": "Number input with mg/dL label",
                    "impact": "Higher HDL reduces cardiovascular risk",
                    "source": "PCE coefficients from Goff et al. 2013"
                }
            },
            
            "frontend_guidance": {
                "form_organization": {
                    "sections": [
                        {
                            "title": "Basic Information",
                            "fields": ["age", "sex", "race"],
                            "description": "Required demographic information"
                        },
                        {
                            "title": "Lifestyle Factors",
                            "fields": ["smoking_status", "years_since_quit", "fitness_level", "alcohol_pattern"],
                            "description": "Modifiable lifestyle risk factors"
                        },
                        {
                            "title": "Medical Factors",
                            "fields": ["systolic_bp", "bp_treated", "diabetes", "bmi"],
                            "description": "Medical conditions and measurements"
                        },
                        {
                            "title": "Laboratory Values (Optional)",
                            "fields": ["total_cholesterol", "hdl_cholesterol"],
                            "description": "Required for cardiovascular risk calculation"
                        }
                    ]
                },
                
                "validation_rules": {
                    "conditional_fields": {
                        "years_since_quit": {
                            "required_if": "smoking_status == 'former'",
                            "message": "Years since quitting required for former smokers"
                        }
                    },
                    "range_validation": {
                        "age": "Must be 18-120 years",
                        "systolic_bp": "Must be 80-250 mmHg",
                        "bmi": "Must be 15-60 kg/m²",
                        "total_cholesterol": "Must be 100-500 mg/dL",
                        "hdl_cholesterol": "Must be 20-150 mg/dL"
                    }
                },
                
                "ui_recommendations": {
                    "input_types": {
                        "age": "number input with spinner",
                        "sex": "radio buttons",
                        "race": "dropdown",
                        "smoking_status": "radio buttons with icons",
                        "years_since_quit": "number input (conditional)",
                        "systolic_bp": "number input with mmHg label",
                        "bp_treated": "checkbox",
                        "bmi": "number input with BMI calculator link",
                        "fitness_level": "radio buttons with activity descriptions",
                        "alcohol_pattern": "radio buttons with definitions",
                        "diabetes": "checkbox with medical emphasis",
                        "total_cholesterol": "number input with mg/dL label",
                        "hdl_cholesterol": "number input with mg/dL label"
                    },
                    "help_text": {
                        "bmi": "BMI = weight(kg) / height(m)² or use BMI calculator",
                        "fitness_level": "Sedentary: <30 min/week, Moderate: 30-150 min/week, High: >150 min/week",
                        "alcohol_pattern": "Moderate: 1-2 drinks/day, Heavy: >2 drinks/day, Binge: >4 drinks/occasion"
                    }
                }
            },
            
            "api_format": {
                "request_example": {
                    "age": 65,
                    "sex": "male",
                    "race": "white",
                    "risk_factors": {
                        "smoking_status": "current",
                        "systolic_bp": 140,
                        "bp_treated": False,
                        "bmi": 28,
                        "fitness_level": "sedentary",
                        "alcohol_pattern": "heavy",
                        "diabetes": False,
                        "total_cholesterol": 220,
                        "hdl_cholesterol": 40
                    },
                    "time_horizon": "1_year"
                },
                "response_format": {
                    "success": True,
                    "lifeExpectancy": 15,
                    "oneYearMortality": 0.1349,
                    "riskFactors": {},
                    "causesOfDeath": [],
                    "cardiovascularRisk": {
                        "risk_10_year": 0.241,
                        "risk_5_year": 0.145,
                        "risk_1_year": 0.024,
                        "risk_level": "High",
                        "population": "white_male",
                        "available": True
                    }
                }
            }
        }
    
    def get_schema(self) -> Dict[str, Any]:
        """Get the complete risk factor schema"""
        return self.schema
    
    def get_required_fields(self) -> Dict[str, Any]:
        """Get required fields schema"""
        return self.schema["required_fields"]
    
    def get_risk_factors(self) -> Dict[str, Any]:
        """Get risk factors schema"""
        return self.schema["risk_factors"]
    
    def get_frontend_guidance(self) -> Dict[str, Any]:
        """Get frontend-specific guidance"""
        return self.schema["frontend_guidance"]
    
    def get_validation_rules(self) -> Dict[str, Any]:
        """Get validation rules for frontend"""
        return self.schema["frontend_guidance"]["validation_rules"]
    
    def get_api_examples(self) -> Dict[str, Any]:
        """Get API request/response examples"""
        return self.schema["api_format"]
    
    def validate_risk_factors(self, risk_factors: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate risk factors against schema
        Returns validation results with errors and warnings
        """
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "corrected_values": {}
        }
        
        for field_name, field_schema in self.schema["risk_factors"].items():
            if field_name in risk_factors:
                value = risk_factors[field_name]
                
                # Type validation
                if field_schema["type"] == "integer" and not isinstance(value, int):
                    validation_result["errors"].append(f"{field_name} must be an integer")
                    validation_result["valid"] = False
                elif field_schema["type"] == "number" and not isinstance(value, (int, float)):
                    validation_result["errors"].append(f"{field_name} must be a number")
                    validation_result["valid"] = False
                elif field_schema["type"] == "string" and not isinstance(value, str):
                    validation_result["errors"].append(f"{field_name} must be a string")
                    validation_result["valid"] = False
                elif field_schema["type"] == "boolean" and not isinstance(value, bool):
                    validation_result["errors"].append(f"{field_name} must be a boolean")
                    validation_result["valid"] = False
                
                # Range validation
                if field_schema["type"] in ["integer", "number"]:
                    if "min" in field_schema and value < field_schema["min"]:
                        validation_result["errors"].append(f"{field_name} must be >= {field_schema['min']}")
                        validation_result["valid"] = False
                    if "max" in field_schema and value > field_schema["max"]:
                        validation_result["errors"].append(f"{field_name} must be <= {field_schema['max']}")
                        validation_result["valid"] = False
                
                # Enum validation
                if "enum" in field_schema:
                    if value not in field_schema["enum"]:
                        validation_result["errors"].append(f"{field_name} must be one of: {field_schema['enum']}")
                        validation_result["valid"] = False
        
        return validation_result

# Create a global instance for easy access
risk_factor_schema = RiskFactorSchema()

if __name__ == "__main__":
    schema = RiskFactorSchema()
    
    print("🎯 RISK FACTOR SCHEMA FOR FRONTEND")
    print("=" * 40)
    
    # Show required fields
    print("\n📋 REQUIRED FIELDS:")
    required = schema.get_required_fields()
    for field, spec in required.items():
        print(f"  {field}: {spec['type']} ({spec['description']})")
    
    # Show risk factors
    print("\n🔬 RISK FACTORS:")
    risk_factors = schema.get_risk_factors()
    for field, spec in risk_factors.items():
        print(f"  {field}: {spec['type']} - {spec['description']}")
        if "enum" in spec:
            print(f"    Options: {spec['enum']}")
        if "min" in spec and "max" in spec:
            print(f"    Range: {spec['min']}-{spec['max']}")
    
    # Show validation example
    print("\n🧪 VALIDATION EXAMPLE:")
    test_data = {
        "age": 65,
        "sex": "male",
        "race": "white",
        "smoking_status": "current",
        "systolic_bp": 140,
        "bmi": 28
    }
    
    validation = schema.validate_risk_factors(test_data)
    print(f"Valid: {validation['valid']}")
    if validation['errors']:
        print(f"Errors: {validation['errors']}")
    if validation['warnings']:
        print(f"Warnings: {validation['warnings']}")
    
    print("\n✅ SCHEMA READY FOR FRONTEND INTEGRATION")
