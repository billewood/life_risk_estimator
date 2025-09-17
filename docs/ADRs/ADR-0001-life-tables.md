# ADR-0001: Baseline Life Tables Selection

## Status
Accepted

## Context
We need to select a source for baseline mortality data to calculate life expectancy and mortality risk estimates. This decision affects the accuracy and credibility of our estimates.

## Decision
We will use US Social Security Administration (SSA) period life tables as our primary source for baseline mortality data.

## Rationale

### Why SSA Life Tables?
1. **Authority**: SSA is the official US government source for life expectancy data
2. **Accuracy**: Based on comprehensive mortality data from all US states
3. **Timeliness**: Updated regularly with recent mortality experience
4. **Transparency**: Methodology and data sources are well-documented
5. **Consistency**: Standard format and age groupings
6. **Accessibility**: Freely available and well-maintained

### Alternative Sources Considered
1. **CDC/NCHS Life Tables**: Similar data but less comprehensive age ranges
2. **WHO Global Health Observatory**: International data, less relevant for US users
3. **Insurance Company Tables**: Proprietary and not publicly available
4. **Academic Research**: Often limited age ranges or specific populations

## Implementation

### Data Format
- **Age Range**: 18-110 years (covers our target population)
- **Sex Categories**: Male, Female (with disclaimer for non-binary users)
- **Variables**: Annual mortality probability (qx) and remaining life expectancy (ex)
- **Update Frequency**: Annual updates from SSA

### Data Processing
1. **Validation**: Ensure data integrity and completeness
2. **Interpolation**: Handle any missing age groups
3. **Extrapolation**: Extend to age 110 if needed
4. **Versioning**: Track data versions for reproducibility

### Quality Assurance
- **Range Checks**: Mortality probabilities between 0 and 1
- **Monotonicity**: Mortality increases with age
- **Consistency**: Life expectancy decreases with age
- **Completeness**: All ages 18-110 covered

## Consequences

### Positive
- **Credibility**: Official government data source
- **Accuracy**: Comprehensive and well-validated
- **Transparency**: Clear methodology and sources
- **Maintainability**: Regular updates available

### Negative
- **US-Only**: Not applicable to international users
- **Period Tables**: Don't account for future mortality improvements
- **Binary Sex**: Limited representation for non-binary users
- **Lag**: Data may be 1-2 years behind current mortality

### Risks
- **Data Changes**: SSA methodology changes could affect compatibility
- **Availability**: SSA data could become unavailable
- **Accuracy**: Period tables may not reflect cohort mortality

## Mitigation
- **Versioning**: Track data versions and handle changes gracefully
- **Fallbacks**: Maintain backup data sources
- **Documentation**: Clear disclaimers about data limitations
- **Updates**: Regular review and update of data sources

## Monitoring
- **Data Quality**: Automated validation of new data files
- **User Feedback**: Monitor for accuracy concerns
- **Source Updates**: Track SSA data release schedule
- **Performance**: Monitor impact on calculation speed

## Future Considerations
- **Cohort Tables**: Consider cohort life tables for future versions
- **International**: Expand to other countries' life tables
- **Demographics**: Include race/ethnicity-specific tables
- **Projections**: Incorporate mortality improvement assumptions

---

**Date**: January 2025  
**Author**: Life Risk Estimator Team  
**Reviewers**: Technical Team, Medical Advisors
