# Real Data Download Guide

Due to access restrictions on government data sources, you'll need to manually download the required datasets. This guide provides exact instructions for obtaining real data from official sources.

## Required Data Files

The calculator requires these specific files in the `data_sources/` directory:

1. `ssa_life_tables_manual.csv`
2. `cdc_cause_death_manual.csv` 
3. `gbd_risk_factors_manual.json`

## 1. SSA Life Tables Download

### Source: Social Security Administration
**URL**: https://www.ssa.gov/oact/STATS/table4c6.html

### Steps:
1. Visit the SSA life tables page
2. Find the most recent period life table (2021 or later)
3. Extract the data showing age-specific mortality rates
4. Create a CSV file with these columns:
   - `age`: Age (0-110)
   - `male_qx`: 1-year probability of death for males
   - `female_qx`: 1-year probability of death for females

### Example format:
```csv
age,male_qx,female_qx
0,0.006400,0.005400
1,0.000400,0.000300
2,0.000300,0.000200
...
```

### Save as: `/Users/williamwood/Code/mortality_calculator/data_sources/ssa_life_tables_manual.csv`

## 2. CDC Cause of Death Data

### Source: CDC WONDER or NCHS Data Portal
**URL**: https://wonder.cdc.gov/

### Steps:
1. Access CDC WONDER mortality database
2. Query for cause-specific death rates by age group
3. Extract percentages for top causes of death by age group
4. Create a CSV file with these columns:
   - `age_group`: Age groups (0-1, 1-4, 5-14, 15-24, 25-34, 35-44, 45-54, 55-64, 65-74, 75-84, 85+)
   - `heart_disease_pct`: Percentage of deaths from heart disease
   - `cancer_pct`: Percentage of deaths from cancer
   - `accidents_pct`: Percentage of deaths from accidents
   - `stroke_pct`: Percentage of deaths from stroke
   - `diabetes_pct`: Percentage of deaths from diabetes

### Example format:
```csv
age_group,heart_disease_pct,cancer_pct,accidents_pct,stroke_pct,diabetes_pct
0-1,1.2,2.5,15.3,0.1,0.1
1-4,2.1,8.2,25.4,0.2,0.1
5-14,3.5,12.1,35.2,0.5,0.2
...
```

### Save as: `/Users/williamwood/Code/mortality_calculator/data_sources/cdc_cause_death_manual.csv`

## 3. Global Burden of Disease Risk Factors

### Source: Institute for Health Metrics and Evaluation (IHME)
**URL**: https://www.healthdata.org/data-tools-practices/interactive-visuals/gbd-results

### Steps:
1. Access the GBD Results Tool
2. Search for relative risk estimates for major risk factors
3. Extract data for: smoking, blood pressure, BMI, physical activity, alcohol
4. Create a JSON file with relative risk estimates

### Example format:
```json
{
  "smoking": {
    "current_vs_never": 2.5,
    "former_vs_never": 1.2,
    "years_to_never_equivalent": 15
  },
  "blood_pressure": {
    "per_20mmhg_sbp": 1.8,
    "treatment_reduction": 0.7
  },
  "bmi": {
    "per_5_units": 1.15,
    "optimal_range": [18.5, 24.9]
  },
  "fitness": {
    "per_met": 0.85,
    "sedentary_vs_active": 1.4
  },
  "alcohol": {
    "moderate_vs_none": 0.9,
    "heavy_vs_none": 1.3,
    "binge_vs_none": 1.2
  }
}
```

### Save as: `/Users/williamwood/Code/mortality_calculator/data_sources/gbd_risk_factors_manual.json`

## Alternative Data Sources

If the primary sources are inaccessible, consider these alternatives:

### CDC Alternative Sources:
- **NCHS Data Portal**: https://www.cdc.gov/nchs/data_access/vitalstatsonline.htm
- **Mortality Multiple Cause Files**: Direct download of mortality data
- **Life Expectancy Reports**: Published annual reports with life tables

### GBD Alternative Sources:
- **Published Papers**: Search for GBD 2019 papers with relative risk estimates
- **Supplementary Materials**: Many GBD papers include detailed relative risk data
- **Meta-analyses**: Use systematic reviews for risk factor estimates

## Data Validation

Once downloaded, the calculator will:
1. **Validate file structure**: Check required columns exist
2. **Log data sources**: Record provenance and integrity hashes
3. **Verify data ranges**: Ensure values are within expected ranges
4. **Cross-reference**: Compare with published statistics for validation

## Running with Real Data

After downloading the files:

```bash
cd /Users/williamwood/Code/mortality_calculator
python main.py
```

The calculator will:
- Process your downloaded files
- Validate data structure
- Log all data usage
- Perform mortality risk calculations with real data

## Important Notes

- **No placeholder data**: The calculator will only work with real downloaded data
- **Complete logging**: All data usage is tracked and logged
- **Data integrity**: Files are hashed to ensure no modifications
- **Source attribution**: Full provenance tracking for transparency

**Ready to process real data once you've downloaded the required files!**
