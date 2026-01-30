"""
AHA PREVENT Equations - Python Implementation
==============================================

This is a faithful Python port of the official AHA PREVENT R package.
The equations and coefficients are unchanged from the original.

Citation:
---------
Krishnan, V., Petito, L. C., Huang, X., & Khan, S. S. (2024). 
'AHAprevent': AHA PREVENT equations for R. R package version 1.0.0.
https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator

References:
-----------
Khan, S. S., et al. (2024). Development and Validation of the American Heart 
Association Predicting Risk of Cardiovascular Disease EVENTs (PREVENT) Equations.
Circulation, 149(6), 430-449.
https://doi.org/10.1161/CIRCULATIONAHA.123.067626

Source:
-------
Official AHA GitHub: https://github.com/AHA-DS-Analytics/PREVENT
"""

import math
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PREVENTResult:
    """Results from PREVENT risk calculation"""
    # 10-year risks (percent)
    risk_10yr_cvd: Optional[float] = None
    risk_10yr_ascvd: Optional[float] = None
    risk_10yr_hf: Optional[float] = None
    # 30-year risks (percent)
    risk_30yr_cvd: Optional[float] = None
    risk_30yr_ascvd: Optional[float] = None
    risk_30yr_hf: Optional[float] = None
    # Metadata
    model: str = "base"
    valid: bool = True
    errors: list = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'risk_10yr_cvd': self.risk_10yr_cvd,
            'risk_10yr_ascvd': self.risk_10yr_ascvd,
            'risk_10yr_hf': self.risk_10yr_hf,
            'risk_30yr_cvd': self.risk_30yr_cvd,
            'risk_30yr_ascvd': self.risk_30yr_ascvd,
            'risk_30yr_hf': self.risk_30yr_hf,
            'model': self.model,
            'valid': self.valid,
            'errors': self.errors or []
        }


def _mmol_conversion(cholesterol_mg_dl: float) -> float:
    """Convert cholesterol from mg/dL to mmol/L"""
    return 0.02586 * cholesterol_mg_dl


def _logistic(logor: float) -> float:
    """Convert log-odds ratio to probability (percent)"""
    return 100 * math.exp(logor) / (1 + math.exp(logor))


def _validate_inputs(sex: int, age: float, tc: float, hdl: float, sbp: float,
                     dm: int, smoking: int, bmi: float, egfr: float,
                     bptreat: int, statin: int) -> tuple:
    """
    Validate input parameters.
    Returns (is_valid, errors, cvd_valid, hf_valid)
    """
    errors = []
    cvd_valid = True
    hf_valid = True
    
    # Sex validation
    if sex not in (0, 1):
        errors.append("sex must be 0 (male) or 1 (female)")
        return False, errors, False, False
    
    # Age validation
    if age is None or age < 30 or age > 79:
        errors.append("age must be between 30-79 years")
        return False, errors, False, False
    
    # Blood pressure validation
    if sbp is None or sbp < 90 or sbp > 200:
        errors.append("sbp must be between 90-200 mmHg")
        return False, errors, False, False
    
    # Diabetes validation
    if dm not in (0, 1):
        errors.append("dm must be 0 or 1")
        return False, errors, False, False
    
    # Smoking validation
    if smoking not in (0, 1):
        errors.append("smoking must be 0 or 1")
        return False, errors, False, False
    
    # eGFR validation
    if egfr is None or egfr <= 0:
        errors.append("egfr must be > 0")
        return False, errors, False, False
    
    # BP treatment validation
    if bptreat not in (0, 1):
        errors.append("bptreat must be 0 or 1")
        return False, errors, False, False
    
    # Cholesterol validation (required for CVD/ASCVD, not HF)
    if tc is None or tc < 130 or tc > 320:
        errors.append("tc must be between 130-320 mg/dL (CVD/ASCVD unavailable)")
        cvd_valid = False
    
    if hdl is None or hdl < 20 or hdl > 100:
        errors.append("hdl must be between 20-100 mg/dL (CVD/ASCVD unavailable)")
        cvd_valid = False
    
    if statin not in (0, 1):
        errors.append("statin must be 0 or 1 (CVD/ASCVD unavailable)")
        cvd_valid = False
    
    # BMI validation (required for HF, not CVD/ASCVD)
    if bmi is None or bmi < 18.5 or bmi >= 40:
        errors.append("bmi must be between 18.5-39.9 kg/m² (HF unavailable)")
        hf_valid = False
    
    return True, errors, cvd_valid, hf_valid


def prevent_base(sex: int, age: float, tc: float, hdl: float, sbp: float,
                 dm: int, smoking: int, bmi: float, egfr: float,
                 bptreat: int, statin: int) -> PREVENTResult:
    """
    Calculate PREVENT base equation risks.
    
    Parameters:
    -----------
    sex : int
        0 = male, 1 = female
    age : float
        Age in years (30-79)
    tc : float
        Total cholesterol in mg/dL (130-320)
    hdl : float
        HDL cholesterol in mg/dL (20-100)
    sbp : float
        Systolic blood pressure in mmHg (90-200)
    dm : int
        Diabetes status (0 = no, 1 = yes)
    smoking : int
        Current smoking status (0 = no, 1 = yes)
    bmi : float
        Body mass index in kg/m² (18.5-39.9)
    egfr : float
        Estimated GFR in mL/min/1.73m² (>0)
    bptreat : int
        On BP treatment (0 = no, 1 = yes)
    statin : int
        On statin (0 = no, 1 = yes)
    
    Returns:
    --------
    PREVENTResult with 10-year and 30-year risks for CVD, ASCVD, and HF
    """
    result = PREVENTResult(model="base", errors=[])
    
    # Validate inputs
    is_valid, errors, cvd_valid, hf_valid = _validate_inputs(
        sex, age, tc, hdl, sbp, dm, smoking, bmi, egfr, bptreat, statin
    )
    result.errors = errors
    
    if not is_valid:
        result.valid = False
        return result
    
    # Pre-calculate common terms
    non_hdl_mmol = _mmol_conversion(tc - hdl)
    hdl_mmol = _mmol_conversion(hdl)
    age_term = (age - 55) / 10
    sbp_low = (min(sbp, 110) - 110) / 20
    sbp_high = (max(sbp, 110) - 130) / 20
    egfr_low = (min(egfr, 60) - 60) / (-15)
    egfr_high = (max(egfr, 60) - 90) / (-15)
    bmi_low = (min(bmi, 30) - 25) / 5 if bmi else 0
    bmi_high = (max(bmi, 30) - 30) / 5 if bmi else 0
    
    # Calculate CVD/ASCVD if cholesterol data is valid
    if cvd_valid:
        if sex == 1:  # Female
            # 10-year CVD
            logor_10yr_cvd = (-3.307728 +
                0.7939329 * age_term +
                0.0305239 * (non_hdl_mmol - 3.5) -
                0.1606857 * (hdl_mmol - 1.3) / 0.3 -
                0.2394003 * sbp_low +
                0.360078 * sbp_high +
                0.8667604 * dm +
                0.5360739 * smoking +
                0.6045917 * egfr_low +
                0.0433769 * egfr_high +
                0.3151672 * bptreat -
                0.1477655 * statin -
                0.0663612 * bptreat * sbp_high +
                0.1197879 * statin * (non_hdl_mmol - 3.5) -
                0.0819715 * age_term * (non_hdl_mmol - 3.5) +
                0.0306769 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.0946348 * age_term * sbp_high -
                0.27057 * age_term * dm -
                0.078715 * age_term * smoking -
                0.1637806 * age_term * egfr_low)
            
            # 30-year CVD
            logor_30yr_cvd = (-1.318827 +
                0.5503079 * age_term -
                0.0928369 * (age_term ** 2) +
                0.0409794 * (non_hdl_mmol - 3.5) -
                0.1663306 * (hdl_mmol - 1.3) / 0.3 -
                0.1628654 * sbp_low +
                0.3299505 * sbp_high +
                0.6793894 * dm +
                0.3196112 * smoking +
                0.1857101 * egfr_low +
                0.0553528 * egfr_high +
                0.2894 * bptreat -
                0.075688 * statin -
                0.056367 * bptreat * sbp_high +
                0.1071019 * statin * (non_hdl_mmol - 3.5) -
                0.0751438 * age_term * (non_hdl_mmol - 3.5) +
                0.0301786 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.0998776 * age_term * sbp_high -
                0.3206166 * age_term * dm -
                0.1607862 * age_term * smoking -
                0.1450788 * age_term * egfr_low)
            
            # 10-year ASCVD
            logor_10yr_ascvd = (-3.819975 +
                0.719883 * age_term +
                0.1176967 * (non_hdl_mmol - 3.5) -
                0.151185 * (hdl_mmol - 1.3) / 0.3 -
                0.0835358 * sbp_low +
                0.3592852 * sbp_high +
                0.8348585 * dm +
                0.4831078 * smoking +
                0.4864619 * egfr_low +
                0.0397779 * egfr_high +
                0.2265309 * bptreat -
                0.0592374 * statin -
                0.0395762 * bptreat * sbp_high +
                0.0844423 * statin * (non_hdl_mmol - 3.5) -
                0.0567839 * age_term * (non_hdl_mmol - 3.5) +
                0.0325692 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.1035985 * age_term * sbp_high -
                0.2417542 * age_term * dm -
                0.0791142 * age_term * smoking -
                0.1671492 * age_term * egfr_low)
            
            # 30-year ASCVD
            logor_30yr_ascvd = (-1.974074 +
                0.4669202 * age_term -
                0.0893118 * (age_term ** 2) +
                0.1256901 * (non_hdl_mmol - 3.5) -
                0.1542255 * (hdl_mmol - 1.3) / 0.3 -
                0.0018093 * sbp_low +
                0.322949 * sbp_high +
                0.6296707 * dm +
                0.268292 * smoking +
                0.100106 * egfr_low +
                0.0499663 * egfr_high +
                0.1875292 * bptreat +
                0.0152476 * statin -
                0.0276123 * bptreat * sbp_high +
                0.0736147 * statin * (non_hdl_mmol - 3.5) -
                0.0521962 * age_term * (non_hdl_mmol - 3.5) +
                0.0316918 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.1046101 * age_term * sbp_high -
                0.2727793 * age_term * dm -
                0.1530907 * age_term * smoking -
                0.1299149 * age_term * egfr_low)
            
        else:  # Male (sex == 0)
            # 10-year CVD
            logor_10yr_cvd = (-3.031168 +
                0.7688528 * age_term +
                0.0736174 * (non_hdl_mmol - 3.5) -
                0.0954431 * (hdl_mmol - 1.3) / 0.3 -
                0.4347345 * sbp_low +
                0.3362658 * sbp_high +
                0.7692857 * dm +
                0.4386871 * smoking +
                0.5378979 * egfr_low +
                0.0164827 * egfr_high +
                0.288879 * bptreat -
                0.1337349 * statin -
                0.0475924 * bptreat * sbp_high +
                0.150273 * statin * (non_hdl_mmol - 3.5) -
                0.0517874 * age_term * (non_hdl_mmol - 3.5) +
                0.0191169 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.1049477 * age_term * sbp_high -
                0.2251948 * age_term * dm -
                0.0895067 * age_term * smoking -
                0.1543702 * age_term * egfr_low)
            
            # 30-year CVD
            logor_30yr_cvd = (-1.148204 +
                0.4627309 * age_term -
                0.0984281 * (age_term ** 2) +
                0.0836088 * (non_hdl_mmol - 3.5) -
                0.1029824 * (hdl_mmol - 1.3) / 0.3 -
                0.2140352 * sbp_low +
                0.2904325 * sbp_high +
                0.5331276 * dm +
                0.2141914 * smoking +
                0.1155556 * egfr_low +
                0.0603775 * egfr_high +
                0.232714 * bptreat -
                0.0272112 * statin -
                0.0384488 * bptreat * sbp_high +
                0.134192 * statin * (non_hdl_mmol - 3.5) -
                0.0511759 * age_term * (non_hdl_mmol - 3.5) +
                0.0165865 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.1101437 * age_term * sbp_high -
                0.2585943 * age_term * dm -
                0.1566406 * age_term * smoking -
                0.1166776 * age_term * egfr_low)
            
            # 10-year ASCVD
            logor_10yr_ascvd = (-3.500655 +
                0.7099847 * age_term +
                0.1658663 * (non_hdl_mmol - 3.5) -
                0.1144285 * (hdl_mmol - 1.3) / 0.3 -
                0.2837212 * sbp_low +
                0.3239977 * sbp_high +
                0.7189597 * dm +
                0.3956973 * smoking +
                0.3690075 * egfr_low +
                0.0203619 * egfr_high +
                0.2036522 * bptreat -
                0.0865581 * statin -
                0.0322916 * bptreat * sbp_high +
                0.114563 * statin * (non_hdl_mmol - 3.5) -
                0.0300005 * age_term * (non_hdl_mmol - 3.5) +
                0.0232747 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.0927024 * age_term * sbp_high -
                0.2018525 * age_term * dm -
                0.0970527 * age_term * smoking -
                0.1217081 * age_term * egfr_low)
            
            # 30-year ASCVD
            logor_30yr_ascvd = (-1.736444 +
                0.3994099 * age_term -
                0.0937484 * (age_term ** 2) +
                0.1744643 * (non_hdl_mmol - 3.5) -
                0.120203 * (hdl_mmol - 1.3) / 0.3 -
                0.0665117 * sbp_low +
                0.2753037 * sbp_high +
                0.4790257 * dm +
                0.1782635 * smoking -
                0.0218789 * egfr_low +
                0.0602553 * egfr_high +
                0.1421182 * bptreat +
                0.0135996 * statin -
                0.0218265 * bptreat * sbp_high +
                0.1013148 * statin * (non_hdl_mmol - 3.5) -
                0.0312619 * age_term * (non_hdl_mmol - 3.5) +
                0.020673 * age_term * (hdl_mmol - 1.3) / 0.3 -
                0.0920935 * age_term * sbp_high -
                0.2159947 * age_term * dm -
                0.1548811 * age_term * smoking -
                0.0712547 * age_term * egfr_low)
        
        # Convert log-odds to probabilities
        result.risk_10yr_cvd = round(_logistic(logor_10yr_cvd), 3)
        result.risk_10yr_ascvd = round(_logistic(logor_10yr_ascvd), 3)
        result.risk_30yr_cvd = round(_logistic(logor_30yr_cvd), 3)
        result.risk_30yr_ascvd = round(_logistic(logor_30yr_ascvd), 3)
    
    # Calculate HF if BMI is valid
    if hf_valid:
        if sex == 1:  # Female
            logor_10yr_hf = (-4.310409 +
                0.8998235 * age_term -
                0.4559771 * sbp_low +
                0.3576505 * sbp_high +
                1.038346 * dm +
                0.583916 * smoking -
                0.0072294 * bmi_low +
                0.2997706 * bmi_high +
                0.7451638 * egfr_low +
                0.0557087 * egfr_high +
                0.3534442 * bptreat -
                0.0981511 * bptreat * sbp_high -
                0.0946663 * age_term * sbp_high -
                0.3581041 * age_term * dm -
                0.1159453 * age_term * smoking -
                0.003878 * age_term * bmi_high -
                0.1884289 * age_term * egfr_low)
            
            logor_30yr_hf = (-2.205379 +
                0.6254374 * age_term -
                0.0983038 * (age_term ** 2) -
                0.3919241 * sbp_low +
                0.3142295 * sbp_high +
                0.8330787 * dm +
                0.3438651 * smoking +
                0.0594874 * bmi_low +
                0.2525536 * bmi_high +
                0.2981642 * egfr_low +
                0.0667159 * egfr_high +
                0.333921 * bptreat -
                0.0893177 * bptreat * sbp_high -
                0.0974299 * age_term * sbp_high -
                0.404855 * age_term * dm -
                0.1982991 * age_term * smoking -
                0.0035619 * age_term * bmi_high -
                0.1564215 * age_term * egfr_low)
        else:  # Male
            logor_10yr_hf = (-3.946391 +
                0.8972642 * age_term -
                0.6811466 * sbp_low +
                0.3634461 * sbp_high +
                0.923776 * dm +
                0.5023736 * smoking -
                0.0485841 * bmi_low +
                0.3726929 * bmi_high +
                0.6926917 * egfr_low +
                0.0251827 * egfr_high +
                0.2980922 * bptreat -
                0.0497731 * bptreat * sbp_high -
                0.1289201 * age_term * sbp_high -
                0.3040924 * age_term * dm -
                0.1401688 * age_term * smoking +
                0.0068126 * age_term * bmi_high -
                0.1797778 * age_term * egfr_low)
            
            logor_30yr_hf = (-1.95751 +
                0.5681541 * age_term -
                0.1048388 * (age_term ** 2) -
                0.4761564 * sbp_low +
                0.30324 * sbp_high +
                0.6840338 * dm +
                0.2656273 * smoking +
                0.0833107 * bmi_low +
                0.26999 * bmi_high +
                0.2541805 * egfr_low +
                0.0638923 * egfr_high +
                0.2583631 * bptreat -
                0.0391938 * bptreat * sbp_high -
                0.1269124 * age_term * sbp_high -
                0.3273572 * age_term * dm -
                0.2043019 * age_term * smoking -
                0.0182831 * age_term * bmi_high -
                0.1342618 * age_term * egfr_low)
        
        result.risk_10yr_hf = round(_logistic(logor_10yr_hf), 3)
        result.risk_30yr_hf = round(_logistic(logor_30yr_hf), 3)
    
    # Age restrictions for 30-year risks
    if age > 59:
        result.risk_30yr_cvd = None
        result.risk_30yr_ascvd = None
        result.risk_30yr_hf = None
        if age <= 79:
            result.errors.append("30-year risks unavailable for age > 59")
    
    return result


def get_prevent_source_info() -> Dict[str, Any]:
    """Return source citation information for PREVENT equations"""
    return {
        'name': 'AHA PREVENT Equations',
        'version': '1.0.0',
        'authors': 'Khan SS, Matsushita K, Sang Y, et al.',
        'title': 'Development and Validation of the American Heart Association '
                 'Predicting Risk of Cardiovascular Disease EVENTs (PREVENT) Equations',
        'journal': 'Circulation',
        'year': 2024,
        'volume': '149(6)',
        'pages': '430-449',
        'doi': '10.1161/CIRCULATIONAHA.123.067626',
        'url': 'https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator',
        'github': 'https://github.com/AHA-DS-Analytics/PREVENT',
        'note': 'Python implementation faithfully ported from official AHA R package'
    }


# Test with example from AHA documentation
if __name__ == "__main__":
    # Example: 45-year-old woman with diabetes
    result = prevent_base(
        sex=1,       # female
        age=45,
        tc=200,      # mg/dL
        hdl=60,      # mg/dL
        sbp=120,     # mmHg
        dm=1,        # diabetes
        smoking=0,   # non-smoker
        bmi=25,      # kg/m²
        egfr=95,     # mL/min/1.73m²
        bptreat=0,   # not on BP treatment
        statin=0     # not on statin
    )
    
    print("PREVENT Base Equation Results")
    print("=" * 40)
    print(f"10-year CVD risk:   {result.risk_10yr_cvd}%")
    print(f"10-year ASCVD risk: {result.risk_10yr_ascvd}%")
    print(f"10-year HF risk:    {result.risk_10yr_hf}%")
    print(f"30-year CVD risk:   {result.risk_30yr_cvd}%")
    print(f"30-year ASCVD risk: {result.risk_30yr_ascvd}%")
    print(f"30-year HF risk:    {result.risk_30yr_hf}%")
    print(f"\nValidation errors: {result.errors}")
