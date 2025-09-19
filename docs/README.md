# Mortality Risk Calculator

A comprehensive, evidence-based mortality risk calculator that uses ONLY real data from official sources and follows best practices for risk assessment.

**IMPORTANT: This calculator does NOT use any placeholder or fake data. All calculations require real data from official sources.**

## Data Sources & Evidence Base

### Baseline Mortality
- **Social Security Administration (SSA) Life Tables**: Official U.S. period life tables with 1-year probability of death by age and sex
- **Source**: https://www.ssa.gov/oact/STATS/table4c6.html
- **Usage**: Convert 1-year probabilities to 6-month and other time horizons

### Cause-Specific Mortality
- **CDC/NCHS Cause of Death Data**: Age-specific cause-of-death patterns
- **Source**: https://www.cdc.gov/nchs/nvss/mortality/lewk3.htm
- **Usage**: Allocate baseline risk across specific causes (heart disease, cancer, etc.)

### Risk Factor Adjustments
- **Global Burden of Disease (GBD)**: Comprehensive relative risk estimates
- **Source**: https://www.healthdata.org/gbd
- **Usage**: Multiplicative risk adjustments for modifiable factors

### Validation Benchmarks
- **ePrognosis**: Validated short-term mortality models for older adults
- **Source**: https://eprognosis.ucsf.edu/
- **Usage**: Calibration and validation for 65+ age group

## Project Structure

```
mortality_calculator/
├── data_logger.py          # Database logging for all data sources
├── data_sources/           # Downloaded and processed data files
├── models/                 # Core calculation models
├── calculators/            # User-facing calculator interfaces
├── validation/             # Validation and benchmarking tools
├── notebooks/              # Analysis and development notebooks
└── tests/                  # Unit and integration tests
```

## Key Features

1. **Transparent Data Tracking**: Every data source, import, and usage is logged
2. **Evidence-Based**: Uses only peer-reviewed, official data sources
3. **Auditable**: Complete traceability of calculations and data provenance
4. **Validated**: Benchmarked against established mortality models
5. **Intervention Modeling**: Simulate risk reduction from lifestyle changes

## Installation

```bash
pip install -r requirements.txt
```

## Usage

**WARNING: This calculator requires real data from official sources. No placeholder data is used.**

```python
from calculators.mortality_calculator import MortalityCalculator

# Initialize calculator (requires real data)
calc = MortalityCalculator()

# Calculate risk for individual (using real data)
risk = calc.calculate_risk(
    age=65,
    sex='male',
    smoking_status='former',
    years_since_quit=5,
    systolic_bp=140,
    bmi=28,
    diabetes=False,
    fitness_level='moderate'
)

# Model interventions (requires real intervention data)
interventions = calc.model_interventions(risk)
```

**Note: Calculator will raise exceptions if real data is not available.**

## Data Integrity

All data imports and usage are automatically logged to `mortality_data_log.db` with:
- Source attribution
- Import timestamps
- Data integrity hashes
- Usage context
- Calculation results

## Disclaimer

This tool provides general information only and is not medical advice. All calculations should be discussed with healthcare providers.
