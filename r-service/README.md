# PREVENT Calculator R Microservice

This is a Plumber REST API that wraps the official `preventr` CRAN package for calculating AHA PREVENT cardiovascular risk scores.

## What It Does

- Exposes the official AHA PREVENT equations via a REST API
- Uses the unchanged `preventr` package from CRAN
- Returns 10-year and 30-year risk for:
  - Total CVD
  - ASCVD
  - Heart Failure
  - Coronary Heart Disease
  - Stroke

## API Endpoints

### GET /health
Health check endpoint.

### POST /calculate
Calculate PREVENT risk scores.

**Required Parameters:**
- `age` (int): Age in years, 30-79
- `sex` (str): "female" or "male"
- `sbp` (float): Systolic blood pressure, 90-180 mmHg
- `bp_tx` (bool): On blood pressure treatment
- `total_c` (float): Total cholesterol, 130-320 mg/dL
- `hdl_c` (float): HDL cholesterol, 20-100 mg/dL
- `statin` (bool): Taking a statin
- `dm` (bool): Has diabetes
- `smoking` (bool): Currently smoking
- `egfr` (float): Estimated GFR, 15-140 mL/min/1.73m²
- `bmi` (float): Body mass index, 18.5-39.9 kg/m²

**Optional Parameters:**
- `hba1c` (float): HbA1c, 4.5-15%
- `uacr` (float): Urine albumin-creatinine ratio, 0.1-25000 mg/g

## Local Development

```bash
# Install R packages
Rscript -e "install.packages(c('plumber', 'preventr'))"

# Run the API
Rscript run.R
```

## Deployment Options

### Option 1: Posit Cloud (Recommended)
1. Create account at https://posit.cloud
2. Create new project
3. Upload api.R and run.R
4. Install packages and run

### Option 2: Docker (Any Platform)
```bash
docker build -t prevent-api .
docker run -p 8000:8000 prevent-api
```

## Example Request

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 50,
    "sex": "female",
    "sbp": 160,
    "bp_tx": true,
    "total_c": 200,
    "hdl_c": 45,
    "statin": false,
    "dm": true,
    "smoking": false,
    "egfr": 90,
    "bmi": 35
  }'
```

## Source

- Package: [preventr on CRAN](https://cran.r-project.org/package=preventr)
- Citation: Khan SS, et al. Circulation. 2023
- AHA Info: https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator
