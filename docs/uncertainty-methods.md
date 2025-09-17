# Uncertainty Methods

## Overview

This document describes the methods used to quantify uncertainty in mortality risk estimates. Uncertainty arises from multiple sources including parameter uncertainty, model uncertainty, and individual variation.

## Sources of Uncertainty

### Parameter Uncertainty
- **Hazard Ratios**: Uncertainty in published risk factor estimates
- **Population Data**: Sampling variability in mortality data
- **Geographic Variation**: Regional differences in mortality rates

### Model Uncertainty
- **Risk Factor Interactions**: Assumption of multiplicative effects
- **Cause Distribution**: Simplified cause-of-death categories
- **Time Trends**: Static vs. dynamic mortality assumptions

### Individual Variation
- **Genetic Factors**: Unmeasured genetic predispositions
- **Environmental Factors**: Local environmental exposures
- **Behavioral Factors**: Individual variation in risk behaviors
- **Healthcare Access**: Differences in medical care quality

## Bootstrap Methods

### Monte Carlo Bootstrap
We use parametric bootstrap methods to quantify uncertainty:

1. **Sample Parameters**: Draw hazard ratios from log-normal distributions
2. **Repeat Calculations**: Recalculate estimates with sampled parameters
3. **Aggregate Results**: Compute confidence intervals from bootstrap samples

### Implementation
```typescript
async function bootstrap(profile: UserProfile, nSamples: number = 200): Promise<BootstrapResult> {
  const results = [];
  
  for (let i = 0; i < nSamples; i++) {
    // Sample hazard ratios from priors
    const sampledHRs = sampleHRs(profile, seed + i);
    
    // Recalculate estimates
    const result = await estimateWithHRs(profile, sampledHRs);
    results.push(result);
  }
  
  return aggregateResults(results);
}
```

### Parameter Distributions
- **Hazard Ratios**: Log-normal distributions with published means and standard deviations
- **Population Data**: Assume fixed (no uncertainty in life tables)
- **Cause Fractions**: Assume fixed (no uncertainty in cause distributions)

## Confidence Intervals

### 80% Confidence Intervals
We report 80% confidence intervals (10th and 90th percentiles) for:
- 1-year mortality risk
- Life expectancy estimates

### Interpretation
- **Point Estimate**: Most likely value (median of bootstrap distribution)
- **Confidence Interval**: Range containing 80% of likely values
- **True Value**: Likely to fall within the confidence interval

### Calculation
```typescript
function confidenceInterval80(values: number[]): { lower: number; upper: number } {
  return {
    lower: quantile(values, 0.1),  // 10th percentile
    upper: quantile(values, 0.9),  // 90th percentile
  };
}
```

## Bootstrap Sample Size

### Default: 200 Samples
- **Balance**: Accuracy vs. computation time
- **Convergence**: Usually sufficient for stable confidence intervals
- **Performance**: Completes within 1-2 seconds on modern devices

### Adaptive Bootstrap
For high-precision estimates, we can increase sample size:
- **Convergence Check**: Monitor Monte Carlo error
- **Dynamic Adjustment**: Increase samples if not converged
- **Maximum**: Capped at 1000 samples for performance

## Sensitivity Analysis

### Risk Factor Sensitivity
We analyze which risk factors contribute most to uncertainty:

1. **Individual Factor Analysis**: Test each factor in isolation
2. **Variance Decomposition**: Quantify contribution to total uncertainty
3. **Ranking**: Order factors by uncertainty contribution

### Implementation
```typescript
async function sensitivityAnalysis(profile: UserProfile): Promise<SensitivityResult[]> {
  const factors = ['smoking', 'alcohol', 'activity', 'bmi'];
  const results = [];
  
  for (const factor of factors) {
    const variance = await calculateFactorVariance(profile, factor);
    results.push({ factor, variance });
  }
  
  return results.sort((a, b) => b.variance - a.variance);
}
```

## Model Validation

### Calibration Assessment
- **Brier Score**: Measure of prediction accuracy
- **Calibration Plots**: Visual assessment of calibration
- **Expected Calibration Error**: Quantitative calibration metric

### Cross-Validation
- **Holdout Validation**: Reserve data for validation
- **Time Series Validation**: Test on future mortality data
- **Geographic Validation**: Test on different regions

## Uncertainty Communication

### Visual Representation
- **Confidence Intervals**: Error bars on all estimates
- **Uncertainty Ranges**: "About X (range Y-Z)" format
- **Icon Arrays**: Visual representation of risk with uncertainty

### Plain Language
- **"About X"**: Point estimates with uncertainty ranges
- **"Likely between Y and Z"**: Confidence interval interpretation
- **"Individual results vary"**: Acknowledgment of individual variation

### Disclaimers
- **Educational Use**: Emphasize educational nature of estimates
- **Individual Variation**: Highlight that individual risk varies significantly
- **Not Predictions**: Clarify that these are not predictions of actual outcomes

## Limitations

### Assumptions
- **Multiplicative Effects**: Risk factors combine multiplicatively
- **Static Risk**: Risk factors don't change over time
- **Population Averages**: Based on population-level data

### Unmeasured Factors
- **Genetic Factors**: Not captured in current model
- **Environmental Factors**: Limited environmental data
- **Healthcare Quality**: Not included in current model

### Model Uncertainty
- **Cause Categories**: Simplified cause-of-death classification
- **Risk Factor Interactions**: Limited interaction modeling
- **Time Trends**: No projection of future mortality trends

## Future Improvements

### Enhanced Uncertainty Quantification
- **Model Uncertainty**: Incorporate uncertainty in model structure
- **Parameter Uncertainty**: More sophisticated parameter distributions
- **Individual Variation**: Better modeling of individual differences

### Validation Studies
- **Prospective Validation**: Test predictions on future data
- **External Validation**: Test on different populations
- **Clinical Validation**: Compare with clinical risk scores

### Advanced Methods
- **Bayesian Methods**: Full Bayesian uncertainty quantification
- **Machine Learning**: Uncertainty in ML-based models
- **Ensemble Methods**: Combine multiple models for uncertainty

## References

### Statistical Methods
- Efron, B. (1979). Bootstrap methods: another look at the jackknife
- Davison, A. C. & Hinkley, D. V. (1997). Bootstrap Methods and Their Application
- Harrell, F. E. (2015). Regression Modeling Strategies

### Mortality Modeling
- Keyfitz, N. (1985). Applied Mathematical Demography
- Preston, S. H., Heuveline, P., & Guillot, M. (2001). Demography: Measuring and Modeling Population Processes
- Aalen, O., Borgan, O., & Gjessing, H. (2008). Survival and Event History Analysis

### Risk Assessment
- Greenland, S. (2005). Multiple-bias modelling for analysis of observational data
- VanderWeele, T. J. (2015). Explanation in Causal Inference: Methods for Mediation and Interaction
- Hernán, M. A. & Robins, J. M. (2020). Causal Inference: What If

---

*This document is updated as uncertainty methods evolve.*
