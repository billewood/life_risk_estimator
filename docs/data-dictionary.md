# Data Dictionary

## Life Tables (`us_life_table.csv`)

### Description
Age- and sex-specific mortality probabilities and remaining life expectancy from US population life tables.

### Schema
| Column | Type | Description | Range |
|--------|------|-------------|-------|
| version | string | Data version identifier | "2025-01" |
| sex | string | Sex category | "male", "female" |
| age | integer | Age in years | 18-110 |
| qx | float | Annual probability of death | 0.0-1.0 |
| ex | float | Remaining life expectancy in years | 0.0-100.0 |

### Data Sources
- **Primary**: US Social Security Administration Period Life Tables
- **Update Frequency**: Annual
- **Coverage**: US population, all states
- **Methodology**: Period life tables based on current mortality experience

### Validation Rules
- All ages must be consecutive integers
- Mortality probabilities must be non-decreasing with age
- Life expectancy must be non-increasing with age
- All probabilities must be between 0 and 1
- Life expectancy must be positive

## Cause Fractions (`cause_fractions.csv`)

### Description
Distribution of causes of death by age band and sex, used for cause-specific mortality estimates.

### Schema
| Column | Type | Description | Range |
|--------|------|-------------|-------|
| version | string | Data version identifier | "2025-01" |
| sex | string | Sex category | "male", "female" |
| ageBand | string | Age group | "18-24", "25-34", ..., "85+" |
| cause | string | Cause category | See cause categories below |
| fraction | float | Proportion of deaths from this cause | 0.0-1.0 |

### Cause Categories
- **cvd**: Cardiovascular disease (heart disease, stroke)
- **cancer**: All cancers combined
- **respiratory**: Respiratory diseases (COPD, pneumonia)
- **injury**: External causes (accidents, violence, suicide)
- **metabolic**: Metabolic disorders (diabetes, kidney disease)
- **neuro**: Neurodegenerative diseases (Alzheimer's, Parkinson's)
- **infectious**: Infectious diseases (pneumonia, sepsis)
- **other**: All other causes

### Data Sources
- **Primary**: CDC WONDER Multiple Cause of Death data
- **Update Frequency**: Annual
- **Coverage**: US mortality data
- **Methodology**: ICD-10 cause-of-death coding

### Validation Rules
- Fractions must sum to 1.0 within each age band and sex
- All fractions must be between 0 and 1
- All cause categories must be present for each age band and sex

## Hazard Ratio Priors (`hr_priors.csv`)

### Description
Hazard ratios and uncertainty estimates for risk factors, derived from published research.

### Schema
| Column | Type | Description | Range |
|--------|------|-------------|-------|
| factor | string | Risk factor name | See factors below |
| level | string | Risk factor level | See levels below |
| hrCentral | float | Central hazard ratio estimate | 0.1-10.0 |
| logSd | float | Log-normal standard deviation | 0.0-1.0 |
| source | string | Data source citation | Free text |

### Risk Factors and Levels

#### Smoking
- **never**: Reference category (HR = 1.0)
- **former**: Former smoker
- **current**: Current smoker

#### Alcohol
- **none**: Reference category (HR = 1.0)
- **moderate**: Moderate alcohol consumption
- **heavy**: Heavy alcohol consumption

#### Physical Activity
- **sedentary**: Reference category (HR = 1.0)
- **low**: Low physical activity
- **moderate**: Moderate physical activity
- **high**: High physical activity

#### BMI
- **normal**: Reference category (HR = 1.0)
- **underweight**: BMI < 18.5
- **overweight**: BMI 25-29.9
- **obese**: BMI ≥ 30

#### Vaccinations
- **unvaccinated**: Reference category (HR = 1.0)
- **vaccinated**: Vaccinated against flu/COVID-19

### Data Sources
- **Primary**: Meta-analyses and systematic reviews
- **Update Frequency**: As new research becomes available
- **Coverage**: Primarily US and European populations
- **Methodology**: Literature review and meta-analysis

### Validation Rules
- All hazard ratios must be positive
- Reference categories must have HR = 1.0
- Log standard deviations must be non-negative
- Sources must be provided for all estimates

## Geographic Data (Future)

### ZIP County Crosswalk (`zip_county_crosswalk.csv`)
| Column | Type | Description |
|--------|------|-------------|
| zip5 | string | 5-digit ZIP code |
| zip3 | string | 3-digit ZIP code |
| county_fips | string | County FIPS code |
| weight | float | Weight for split counties |

### Geographic Modifiers (`geo_modifiers.csv`)
| Column | Type | Description |
|--------|------|-------------|
| county_fips | string | County FIPS code |
| hr_geo | float | Geographic hazard ratio |
| notes | string | Notes about the modifier |

## Data Quality Assurance

### Automated Validation
- **Range Checks**: All values within expected ranges
- **Consistency Checks**: Logical relationships between variables
- **Completeness Checks**: All required data present
- **Sum Checks**: Fractions sum to 1.0 where required

### Manual Review
- **Source Verification**: Check data sources and citations
- **Methodology Review**: Validate calculation methods
- **Expert Review**: Medical and statistical expert review
- **Version Control**: Track all data changes

### Update Process
1. **Data Collection**: Gather new data from authoritative sources
2. **Validation**: Run automated and manual validation checks
3. **Review**: Expert review of new data
4. **Testing**: Test new data with existing models
5. **Deployment**: Deploy new data version
6. **Documentation**: Update documentation and changelog

## Data Privacy and Security

### Privacy Protection
- **No Personal Data**: All data is population-level aggregates
- **No Identifiers**: No personal identifiers in any data files
- **Public Sources**: All data from publicly available sources
- **Aggregated Data**: All data aggregated to protect privacy

### Security Measures
- **Access Control**: Limited access to data files
- **Version Control**: Track all data changes
- **Backup**: Regular backups of data files
- **Integrity Checks**: Verify data integrity

## Data Limitations

### Coverage
- **US Only**: Currently limited to US population data
- **Age Range**: Limited to ages 18-110
- **Time Period**: Based on recent mortality experience
- **Demographics**: Limited demographic breakdowns

### Accuracy
- **Population Averages**: Individual risk varies significantly
- **Statistical Uncertainty**: All estimates have uncertainty
- **Data Lag**: Data may be 1-2 years behind current mortality
- **Methodology**: Based on standard actuarial methods

### Updates
- **Annual Updates**: Most data updated annually
- **Research Updates**: Risk factors updated as new research emerges
- **Version Control**: All changes tracked and documented
- **Backward Compatibility**: Maintain compatibility with previous versions

---

*This data dictionary is updated with each data version release.*
