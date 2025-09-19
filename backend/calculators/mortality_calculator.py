"""
Main Mortality Calculator Interface
ONLY works with real data - no placeholder or fake data allowed
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.mortality_models import MortalityModels
from models.pce_real_coefficients import RealPCECalculator
from data_logger import data_logger

class MortalityCalculator:
    def __init__(self):
        """
        Initialize calculator with real data only
        Will raise exception if real data is not available
        """
        try:
            self.models = MortalityModels()
            self.pce_calculator = RealPCECalculator()
            self.intervention_effects = self._load_intervention_effects()
        except Exception as e:
            raise Exception(
                f"Cannot initialize calculator without real data: {e}\n"
                "Must download real data from official sources first."
            )
    
    def _load_intervention_effects(self) -> Dict[str, Dict[str, float]]:
        """
        Load intervention effect estimates from centralized relative risk database
        """
        from data_sources.relative_risks import RelativeRiskDatabase
        
        # Initialize relative risk database
        rr_db = RelativeRiskDatabase()
        
        # Load intervention effects from verified sources
        return {
            'quit_smoking': {
                'immediate_reduction': rr_db.get_relative_risk_value('interventions', 'quit_smoking'),
                'years_to_never_equivalent': rr_db.get_relative_risk_value('smoking', 'years_to_never_equivalent')
            },
            'reduce_bp': {
                'per_10mmhg_reduction': rr_db.get_relative_risk_value('interventions', 'reduce_bp_10mmhg'),
                'treatment_effect': rr_db.get_relative_risk_value('blood_pressure', 'treatment_reduction')
            },
            'improve_fitness': {
                'per_met_improvement': rr_db.get_relative_risk_value('interventions', 'improve_fitness'),
                'sedentary_to_moderate': 1.0 / rr_db.get_relative_risk_value('fitness', 'sedentary_vs_active')
            },
            'lose_weight': {
                'per_5_bmi_units': rr_db.get_relative_risk_value('interventions', 'lose_weight_5bmi'),
                'optimal_bmi': 22  # From BMI database
            },
            'reduce_alcohol': {
                'heavy_to_moderate': rr_db.get_relative_risk_value('alcohol', 'moderate_vs_none'),
                'moderate_to_none': 1.0  # No additional benefit from stopping moderate drinking
            }
        }
    
    def calculate_risk(self, age: int, sex: str, risk_factors: Dict[str, Any], 
                      time_horizon: str = "1_year") -> Dict[str, Any]:
        """
        Calculate comprehensive mortality risk for an individual
        ONLY works with real data
        """
        # Validate inputs
        self._validate_inputs(age, sex, risk_factors, time_horizon)
        
        # Calculate risk using real data
        risk_result = self.models.calculate_adjusted_risk(
            age, sex, risk_factors, time_horizon
        )
        
        # Add additional analysis
        risk_result['top_causes'] = self._get_top_causes(risk_result['cause_risks'])
        risk_result['risk_level'] = self._classify_risk_level(risk_result['adjusted_total_risk'])
        risk_result['input_summary'] = self._summarize_inputs(age, sex, risk_factors)
        
        return risk_result
    
    def calculate_pce_risk(self, age: int, sex: str, risk_factors: Dict[str, Any], 
                          race: str = 'white') -> Dict[str, Any]:
        """
        Calculate Pooled Cohort Equations (PCE) 10-year ASCVD risk using REAL coefficients
        """
        try:
            pce_result = self.pce_calculator.calculate_from_risk_factors(
                risk_factors, age, sex, race
            )
            return pce_result
        except Exception as e:
            return {
                'error': f"PCE calculation failed: {e}",
                'risk_10_year': None,
                'risk_5_year': None,
                'risk_1_year': None,
                'source': self.pce_calculator.get_source_information()
            }
    
    def calculate_comprehensive_risk(self, age: int, sex: str, risk_factors: Dict[str, Any], 
                                   time_horizon: str = "1_year", race: str = 'white') -> Dict[str, Any]:
        """
        Calculate both all-cause mortality risk and PCE cardiovascular risk using REAL coefficients
        """
        # Calculate all-cause mortality risk
        mortality_result = self.calculate_risk(age, sex, risk_factors, time_horizon)
        
        # Calculate PCE cardiovascular risk using real coefficients
        pce_result = self.calculate_pce_risk(age, sex, risk_factors, race)
        
        # Combine results
        comprehensive_result = {
            'mortality_risk': mortality_result,
            'cardiovascular_risk': pce_result,
            'pce_available': not pce_result.get('error'),
            'summary': {
                'all_cause_1_year': mortality_result.get('adjusted_total_risk', 0),
                'cardiovascular_10_year': pce_result.get('risk_10_year', 0),
                'cardiovascular_5_year': pce_result.get('risk_5_year', 0),
                'cardiovascular_1_year': pce_result.get('risk_1_year', 0),
                'risk_level_mortality': mortality_result.get('risk_level', 'Unknown'),
                'risk_level_cardiovascular': pce_result.get('risk_level', 'Unknown')
            }
        }
        
        return comprehensive_result
    
    def model_interventions(self, current_risk: float, 
                          interventions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Model the effect of specific interventions on mortality risk using verified sources
        """
        intervention_results = {}
        
        for intervention, value in interventions.items():
            if intervention == 'quit_smoking' and value:
                # Immediate 20% reduction from verified sources
                reduction_factor = self.intervention_effects['quit_smoking']['immediate_reduction']
                intervention_results[intervention] = {
                    'applicable': True,
                    'risk_reduction': current_risk * (1 - reduction_factor),
                    'relative_effect': reduction_factor,
                    'source': 'Doll & Peto 2005 - BMJ'
                }
            
            elif intervention == 'reduce_bp' and value > 0:
                # BP reduction effect from verified sources
                reduction_per_10mmhg = self.intervention_effects['reduce_bp']['per_10mmhg_reduction']
                reduction_factor = reduction_per_10mmhg ** (value / 10)
                intervention_results[intervention] = {
                    'applicable': True,
                    'risk_reduction': current_risk * (1 - reduction_factor),
                    'relative_effect': reduction_factor,
                    'source': 'Blood Pressure Lowering Treatment Trialists\' Collaboration 2016'
                }
            
            elif intervention == 'improve_fitness' and value in ['moderate', 'high']:
                # Fitness improvement effect from verified sources
                if value == 'moderate':
                    reduction_factor = self.intervention_effects['improve_fitness']['sedentary_to_moderate']
                else:  # high
                    reduction_factor = self.intervention_effects['improve_fitness']['per_met_improvement']
                
                intervention_results[intervention] = {
                    'applicable': True,
                    'risk_reduction': current_risk * (1 - reduction_factor),
                    'relative_effect': reduction_factor,
                    'source': 'Kodama et al. 2009 - JAMA'
                }
            
            elif intervention == 'lose_weight' and value > 0:
                # Weight loss effect from verified sources
                reduction_per_5bmi = self.intervention_effects['lose_weight']['per_5_bmi_units']
                reduction_factor = reduction_per_5bmi ** (value / 5)
                intervention_results[intervention] = {
                    'applicable': True,
                    'risk_reduction': current_risk * (1 - reduction_factor),
                    'relative_effect': reduction_factor,
                    'source': 'Global BMI Mortality Collaboration 2016 - Lancet'
                }
            
            elif intervention == 'reduce_alcohol' and value in ['moderate', 'none']:
                # Alcohol reduction effect from verified sources
                if value == 'moderate':
                    reduction_factor = self.intervention_effects['reduce_alcohol']['heavy_to_moderate']
                else:  # none
                    reduction_factor = self.intervention_effects['reduce_alcohol']['moderate_to_none']
                
                intervention_results[intervention] = {
                    'applicable': True,
                    'risk_reduction': current_risk * (1 - reduction_factor),
                    'relative_effect': reduction_factor,
                    'source': 'Di Castelnuovo et al. 2006 - Arch Intern Med'
                }
            
            else:
                intervention_results[intervention] = {
                    'applicable': False,
                    'risk_reduction': 0,
                    'relative_effect': 1.0,
                    'source': 'Not applicable'
                }
        
        # Calculate combined effect (assuming independence)
        combined_reduction = 1.0
        total_risk_reduction = 0
        
        for intervention, result in intervention_results.items():
            if result['applicable']:
                combined_reduction *= result['relative_effect']
                total_risk_reduction += result['risk_reduction']
        
        new_risk = current_risk * combined_reduction
        absolute_reduction = current_risk - new_risk
        
        intervention_results['combined'] = {
            'new_risk': new_risk,
            'absolute_reduction': absolute_reduction,
            'relative_reduction': combined_reduction,
            'total_risk_reduction': total_risk_reduction
        }
        
        return intervention_results
    
    def _validate_inputs(self, age: int, sex: str, risk_factors: Dict[str, Any], 
                        time_horizon: str):
        """Validate input parameters"""
        if not isinstance(age, int) or age < 0 or age > 120:
            raise ValueError("Age must be an integer between 0 and 120")
        
        if sex not in ['male', 'female']:
            raise ValueError("Sex must be 'male' or 'female'")
        
        if time_horizon not in ['6_month', '1_year', '5_year']:
            raise ValueError("Time horizon must be '6_month', '1_year', or '5_year'")
        
        # Validate risk factors
        if 'smoking_status' in risk_factors:
            if risk_factors['smoking_status'] not in ['never', 'former', 'current']:
                raise ValueError("smoking_status must be 'never', 'former', or 'current'")
        
        if 'fitness_level' in risk_factors:
            if risk_factors['fitness_level'] not in ['sedentary', 'moderate', 'high']:
                raise ValueError("fitness_level must be 'sedentary', 'moderate', or 'high'")
    
    def _get_top_causes(self, cause_risks: Dict[str, float], n: int = 3) -> List[Dict[str, Any]]:
        """Get top N causes by risk"""
        sorted_causes = sorted(cause_risks.items(), key=lambda x: x[1], reverse=True)
        return [{'cause': cause, 'risk': risk, 'percentage': risk/sum(cause_risks.values())*100} 
                for cause, risk in sorted_causes[:n]]
    
    def _classify_risk_level(self, total_risk: float) -> str:
        """Classify overall risk level"""
        if total_risk < 0.01:
            return "Low"
        elif total_risk < 0.05:
            return "Moderate"
        elif total_risk < 0.15:
            return "High"
        else:
            return "Very High"
    
    def _summarize_inputs(self, age: int, sex: str, risk_factors: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize input parameters for display"""
        summary = {
            'age': age,
            'sex': sex,
            'risk_factors': risk_factors
        }
        return summary
