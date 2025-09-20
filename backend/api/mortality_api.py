"""
Mortality Calculator API
Provides REST API interface for JavaScript frontend
"""

from flask import Flask, request, jsonify
import json
import sys
import os
from typing import List, Dict

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from calculators.mortality_calculator import MortalityCalculator
from data_sources.relative_risks import RelativeRiskDatabase
from data_sources.data_manager import DataManager
from api.risk_factor_schema import risk_factor_schema

app = Flask(__name__)

# Initialize calculator
calculator = MortalityCalculator()
rr_db = RelativeRiskDatabase()
data_manager = DataManager()

def _calculate_life_expectancy(age: int, sex: str, adjusted_risk: float) -> float:
    """Calculate life expectancy using SSA actuarial tables with risk adjustment"""
    try:
        # Get baseline life expectancy from SSA actuarial tables
        baseline_ex = calculator.models.calculate_life_expectancy(age, sex)
        print(f"DEBUG: baseline_ex = {baseline_ex}")
        
        # Calculate risk multiplier (how much higher than baseline risk)
        baseline_risk = calculator.models.calculate_baseline_mortality(age, sex, "1_year")
        print(f"DEBUG: baseline_risk = {baseline_risk}")
        risk_multiplier = adjusted_risk / baseline_risk if baseline_risk > 0 else 1.0
        print(f"DEBUG: risk_multiplier = {risk_multiplier}")
        
        # Apply risk adjustment to life expectancy
        # Higher risk = lower life expectancy
        adjusted_ex = baseline_ex / risk_multiplier
        print(f"DEBUG: adjusted_ex = {adjusted_ex}")
        
        result = max(adjusted_ex, 1.0)  # At least 1 year
        print(f"DEBUG: final result = {result}")
        return result
        
    except Exception as e:
        print(f"Error calculating life expectancy: {e}")
        # Fallback to simple approximation if SSA data fails
        fallback = max(85 - age if sex == 'male' else 88 - age, 1.0)
        print(f"DEBUG: using fallback = {fallback}")
        return fallback

def _format_causes_of_death(top_causes: List[Dict]) -> List[Dict]:
    """Format causes of death for frontend consumption"""
    formatted_causes = []
    for cause in top_causes:
        formatted_causes.append({
            'cause': cause['cause'],
            'risk': cause['risk'],
            'percentage': cause['percentage'],
            'riskLevel': _classify_cause_risk(cause['percentage'])
        })
    return formatted_causes

def _classify_cause_risk(percentage: float) -> str:
    """Classify cause risk level based on percentage"""
    if percentage >= 40:
        return 'Very High'
    elif percentage >= 25:
        return 'High'
    elif percentage >= 15:
        return 'Moderate'
    else:
        return 'Low'

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Mortality Calculator API is running',
        'version': '1.0.0'
    })

@app.route('/api/schema', methods=['GET'])
def get_risk_factor_schema():
    """
    Get complete risk factor schema for frontend integration
    Provides field definitions, validation rules, and UI guidance
    """
    try:
        schema = risk_factor_schema.get_schema()
        
        return jsonify({
            'success': True,
            'schema': schema,
            'message': 'Risk factor schema for frontend integration'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get schema: {str(e)}'
        }), 500

@app.route('/api/schema/validation', methods=['POST'])
def validate_risk_factors():
    """
    Validate risk factors against schema
    Returns validation results with errors and warnings
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate risk factors
        validation_result = risk_factor_schema.validate_risk_factors(data.get('risk_factors', {}))
        
        return jsonify({
            'success': True,
            'validation': validation_result,
            'message': 'Risk factor validation completed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Validation failed: {str(e)}'
        }), 500

@app.route('/api/calculate-risk', methods=['POST'])
def calculate_risk():
    """Calculate mortality risk for an individual"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'sex', 'risk_factors']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Extract parameters
        age = data['age']
        sex = data['sex']
        risk_factors = data['risk_factors']
        time_horizon = data.get('time_horizon', '1_year')
        
        # Calculate mortality risk (PCE requires real coefficients)
        race = data.get('race', 'white')  # Default to white if not provided
        result = calculator.calculate_comprehensive_risk(age, sex, risk_factors, time_horizon, race)
        
        # Extract mortality and PCE results
        mortality_result = result['mortality_risk']
        pce_result = result['cardiovascular_risk']
        
        # Add source information for each risk adjustment
        risk_adjustments_with_sources = {}
        for factor, rr_value in mortality_result['risk_adjustments'].items():
            try:
                # Map factor names to database categories
                category_map = {
                    'smoking_rr': 'smoking',
                    'bp_rr': 'blood_pressure',
                    'bmi_rr': 'bmi',
                    'fitness_rr': 'fitness',
                    'alcohol_rr': 'alcohol'
                }
                
                category = category_map.get(factor, 'unknown')
                if category != 'unknown':
                    # Get source information
                    if factor == 'smoking_rr':
                        source_info = rr_db.get_source_info('smoking', 'current_vs_never')
                    elif factor == 'bp_rr':
                        source_info = rr_db.get_source_info('blood_pressure', 'per_20mmhg_sbp')
                    elif factor == 'bmi_rr':
                        source_info = rr_db.get_source_info('bmi', 'per_5_units')
                    elif factor == 'fitness_rr':
                        source_info = rr_db.get_source_info('fitness', 'sedentary_vs_active')
                    elif factor == 'alcohol_rr':
                        source_info = rr_db.get_source_info('alcohol', 'heavy_vs_none')
                    
                    risk_adjustments_with_sources[factor] = {
                        'value': rr_value,
                        'source': source_info['source'],
                        'study_type': source_info['study_type'],
                        'sample_size': source_info['sample_size'],
                        'confidence_interval': source_info['confidence_interval'],
                        'url': source_info['url']
                    }
                else:
                    risk_adjustments_with_sources[factor] = {
                        'value': rr_value,
                        'source': 'Unknown',
                        'study_type': 'Unknown',
                        'sample_size': 'Unknown',
                        'confidence_interval': 'Unknown',
                        'url': 'Unknown'
                    }
            except Exception as e:
                risk_adjustments_with_sources[factor] = {
                    'value': rr_value,
                    'source': 'Error retrieving source',
                    'study_type': 'Unknown',
                    'sample_size': 'Unknown',
                    'confidence_interval': 'Unknown',
                    'url': 'Unknown'
                }
        
        # Prepare response in the format expected by frontend
        response = {
            'success': True,
            'lifeExpectancy': _calculate_life_expectancy(age, sex, mortality_result['adjusted_total_risk']),
            'oneYearMortality': mortality_result['adjusted_total_risk'],
            'riskFactors': risk_adjustments_with_sources,
            'causesOfDeath': _format_causes_of_death(mortality_result['top_causes']),
            'cardiovascularRisk': {
                'risk_10_year': pce_result.get('risk_10_year', 0),
                'risk_1_year': pce_result.get('risk_1_year', 0),
                'risk_level': pce_result.get('risk_level', 'Unknown'),
                'population': pce_result.get('population', 'Unknown'),
                'available': result.get('pce_available', False),
                'source': pce_result.get('source', {}),
                'error': pce_result.get('error', None)
            },
            'metadata': {
                'baseline_risk': mortality_result['baseline_risk'],
                'risk_level': mortality_result['risk_level'],
                'time_horizon': mortality_result['time_horizon'],
                'input_summary': mortality_result['input_summary'],
                'summary_comparison': result.get('summary', {})
            },
            'data_sources': {
                'baseline_mortality': {
                    'source': 'Social Security Administration Life Tables',
                    'url': 'https://www.ssa.gov/oact/STATS/table4c6.html',
                    'description': 'Official U.S. mortality probabilities by age and sex'
                },
                'cause_allocation': {
                    'source': 'CDC/NCHS Cause of Death Data',
                    'url': 'https://wonder.cdc.gov/',
                    'description': 'Age-specific cause-of-death patterns'
                },
                'cardiovascular_risk': {
                    'source': 'Pooled Cohort Equations (PCE) - 2013 ACC/AHA Guidelines',
                    'url': 'https://www.ahajournals.org/doi/10.1161/01.cir.0000437741.48606.98',
                    'description': 'U.S. population-specific 10-year ASCVD risk prediction'
                }
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-interventions', methods=['POST'])
def model_interventions():
    """Model the effect of interventions on mortality risk"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'current_risk' not in data or 'interventions' not in data:
            return jsonify({'error': 'Missing required fields: current_risk, interventions'}), 400
        
        current_risk = data['current_risk']
        interventions = data['interventions']
        
        # Model interventions
        intervention_results = calculator.model_interventions(current_risk, interventions)
        
        # Add source information for intervention effects
        intervention_effects_with_sources = {}
        for intervention, effect in intervention_results.items():
            if intervention != 'combined' and effect.get('applicable', False):
                try:
                    # Get source information for intervention effects
                    if intervention == 'quit_smoking':
                        source_info = rr_db.get_source_info('interventions', 'quit_smoking')
                    elif intervention == 'reduce_bp':
                        source_info = rr_db.get_source_info('interventions', 'reduce_bp_10mmhg')
                    elif intervention == 'improve_fitness':
                        source_info = rr_db.get_source_info('interventions', 'improve_fitness')
                    elif intervention == 'lose_weight':
                        source_info = rr_db.get_source_info('interventions', 'lose_weight_5bmi')
                    else:
                        source_info = {
                            'source': 'Unknown',
                            'study_type': 'Unknown',
                            'sample_size': 'Unknown',
                            'confidence_interval': 'Unknown',
                            'url': 'Unknown'
                        }
                    
                    intervention_effects_with_sources[intervention] = {
                        'effect': effect,
                        'source': source_info['source'],
                        'study_type': source_info['study_type'],
                        'sample_size': source_info['sample_size'],
                        'confidence_interval': source_info['confidence_interval'],
                        'url': source_info['url']
                    }
                except Exception as e:
                    intervention_effects_with_sources[intervention] = {
                        'effect': effect,
                        'source': 'Error retrieving source',
                        'study_type': 'Unknown',
                        'sample_size': 'Unknown',
                        'confidence_interval': 'Unknown',
                        'url': 'Unknown'
                    }
        
        response = {
            'success': True,
            'interventions': intervention_effects_with_sources,
            'combined': intervention_results.get('combined', {})
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/relative-risks', methods=['GET'])
def get_relative_risks():
    """Get all relative risks with source information"""
    try:
        all_risks = rr_db.get_all_relative_risks()
        return jsonify({
            'success': True,
            'relative_risks': all_risks
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data-status', methods=['GET'])
def get_data_status():
    """Get status of all data sources"""
    try:
        status = data_manager.get_data_status()
        return jsonify({
            'success': True,
            'data_status': status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-sources', methods=['GET'])
def verify_sources():
    """Verify all relative risk sources"""
    try:
        issues = rr_db.verify_sources()
        return jsonify({
            'success': True,
            'verification_passed': len(issues) == 0,
            'issues': issues
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-relative-risks', methods=['GET'])
def export_relative_risks():
    """Export relative risks to CSV"""
    try:
        csv_file = rr_db.export_to_csv()
        return jsonify({
            'success': True,
            'message': f'Relative risks exported to {csv_file}',
            'file_path': csv_file
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import os
    
    print("Starting Mortality Calculator API...")
    print("API Endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/calculate-risk - Calculate mortality risk")
    print("  POST /api/model-interventions - Model intervention effects")
    print("  GET  /api/relative-risks - Get all relative risks with sources")
    print("  GET  /api/data-status - Get data source status")
    print("  GET  /api/verify-sources - Verify relative risk sources")
    print("  GET  /api/export-relative-risks - Export relative risks to CSV")
    print()
    
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('ENVIRONMENT', 'development') == 'development'
    
    print(f"Starting server on port {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)
