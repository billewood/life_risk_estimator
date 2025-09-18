# Data Sources Documentation

This document tracks all data sources used in the life risk estimator, including their URLs, update frequencies, and assumptions made.

## Primary Data Sources

### 1. Social Security Administration Actuarial Life Tables
- **URL**: https://www.ssa.gov/oact/STATS/table4c6.html
- **Description**: Official US life tables used for Social Security calculations
- **Update Frequency**: Annual
- **Data Format**: HTML tables, downloadable as CSV
- **Coverage**: Ages 0-119, by sex
- **Last Updated**: 2024
- **Usage**: Primary source for baseline mortality rates (qx values)

### 2. CDC WONDER Mortality Statistics
- **URL**: https://wonder.cdc.gov/mortSQL.html
- **Description**: CDC's web-based query system for mortality data
- **Update Frequency**: Annual
- **Data Format**: CSV download via web interface
- **Coverage**: US mortality by age, sex, cause of death
- **Last Updated**: 2024
- **Usage**: Cause-of-death fractions and validation

### 3. Human Mortality Database
- **URL**: https://www.mortality.org/
- **Description**: Comprehensive international mortality database
- **Update Frequency**: Annual
- **Data Format**: CSV files
- **Coverage**: US and international mortality data
- **Last Updated**: 2024
- **Usage**: Validation and international comparisons

### 4. National Center for Health Statistics (NCHS)
- **URL**: https://www.cdc.gov/nchs/nvss/mortality.htm
- **Description**: Official US mortality statistics
- **Update Frequency**: Annual
- **Data Format**: Various (CSV, Excel, PDF)
- **Coverage**: US mortality by age, sex, cause, geography
- **Last Updated**: 2024
- **Usage**: Cause-of-death fractions and regional adjustments

## Data Processing Assumptions

### Mortality Rate Calculation
- **Formula**: Gompertz-Makeham model: μ(x) = a + b * exp(c * x)
- **Parameters**: Based on SSA life tables, adjusted for recent trends
- **Age Range**: 18-100 years
- **Sex Categories**: Male, Female, Other (mapped to average of male/female)

### Cause-of-Death Fractions
- **Source**: CDC WONDER Multiple Cause of Death data
- **ICD-10 Codes**: Mapped to simplified cause categories
- **Age Bands**: 18-29, 30-44, 45-59, 60-74, 75+
- **Update Frequency**: Annual

### Risk Factor Adjustments
- **Source**: Peer-reviewed epidemiological studies
- **Hazard Ratios**: Meta-analyses and large cohort studies
- **Confidence Intervals**: 95% CI where available
- **Update Frequency**: As new studies are published

## Data Quality Metrics

### Completeness
- **Mortality Data**: 100% coverage for ages 18-100
- **Cause Data**: 95%+ coverage for major causes
- **Risk Factors**: Varies by factor (80-95% coverage)

### Accuracy
- **Mortality Rates**: Based on official government statistics
- **Cause Fractions**: Based on death certificates (high accuracy)
- **Risk Factors**: Based on peer-reviewed research

### Timeliness
- **Mortality Data**: 1-2 year lag
- **Cause Data**: 1-2 year lag
- **Risk Factors**: 2-5 year lag (depends on study publication)

## Update Schedule

- **Monthly**: Check for new data releases
- **Quarterly**: Review and update risk factor parameters
- **Annually**: Full data refresh and validation
- **As Needed**: Emergency updates for major changes

## Data Validation

### Cross-Validation
- Compare SSA tables with CDC WONDER data
- Validate against Human Mortality Database
- Check for consistency across age groups

### Quality Checks
- Mortality rates should increase with age
- Cause fractions should sum to 1.0
- Risk factor effects should be biologically plausible

## Backup Data Sources

### Primary Backup
- **Source**: Human Mortality Database
- **Usage**: When SSA data is unavailable
- **Coverage**: Similar to primary sources

### Secondary Backup
- **Source**: Sample data generation
- **Usage**: When all external sources fail
- **Coverage**: Realistic estimates based on literature

## Data Access Methods

### API Access
- **SSA**: No official API, web scraping required
- **CDC WONDER**: REST API available
- **HMD**: Direct file download

### Caching Strategy
- **Local Cache**: 24 hours for frequently accessed data
- **CDN Cache**: 7 days for static data
- **Database Cache**: 30 days for processed data

## Compliance and Ethics

### Data Privacy
- No personal data stored
- All calculations performed client-side
- No data transmitted to external servers

### Attribution
- All data sources properly cited
- Version numbers tracked
- Update dates recorded

### Accuracy Claims
- Estimates are educational only
- Not for medical decisions
- Individual variation not captured
