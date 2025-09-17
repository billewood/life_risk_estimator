# ADR-0002: Client-Side Computation for Privacy

## Status
Accepted

## Context
We need to decide how to handle user data and computation to balance accuracy, performance, and privacy. This decision affects user trust, regulatory compliance, and technical architecture.

## Decision
We will implement client-side computation with no server-side data storage or processing for user inputs.

## Rationale

### Why Client-Side Computation?
1. **Privacy Protection**: User data never leaves their device
2. **Regulatory Compliance**: Minimizes data protection obligations
3. **User Trust**: Transparent about data handling
4. **Technical Simplicity**: No backend infrastructure needed
5. **Cost Efficiency**: No server costs for computation
6. **Scalability**: No server load from user calculations

### Alternative Approaches Considered
1. **Server-Side Computation**: Better performance but requires data transmission
2. **Hybrid Approach**: Some client, some server computation
3. **Third-Party Services**: External computation services
4. **Edge Computing**: Computation at CDN edge locations

## Implementation

### Architecture
- **Frontend-Only**: All computation in the browser
- **Static Assets**: Population data shipped with application
- **No Backend**: No server-side processing required
- **Local Storage**: User inputs stored locally only

### Data Handling
- **Input Validation**: Client-side validation of user inputs
- **Local Storage**: Browser storage for user preferences
- **No Transmission**: Personal data never sent to servers
- **Static Data**: Population data loaded as static files

### Performance Considerations
- **Bundle Size**: Include necessary data in application bundle
- **Caching**: Browser caching for repeated calculations
- **Lazy Loading**: Load data files on demand
- **Compression**: Compress static data files

### Security Measures
- **HTTPS**: Encrypt all communication
- **CSP**: Content Security Policy headers
- **No Third-Party**: No external scripts or tracking
- **Input Sanitization**: Validate all user inputs

## Consequences

### Positive
- **Privacy**: Maximum privacy protection for users
- **Trust**: Users control their own data
- **Compliance**: Minimal regulatory requirements
- **Cost**: No server infrastructure costs
- **Simplicity**: Simpler deployment and maintenance

### Negative
- **Performance**: Slower computation than server-side
- **Bundle Size**: Larger application bundle
- **Device Requirements**: Requires capable client devices
- **Offline Limitations**: Requires internet for initial load
- **Data Updates**: Harder to update population data

### Risks
- **Performance**: Slow computation on older devices
- **Data Staleness**: Population data may become outdated
- **Browser Limitations**: Different browsers may have different performance
- **Memory Usage**: Large datasets in browser memory

## Mitigation
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Data Versioning**: Clear versioning of population data
- **Performance Monitoring**: Track computation performance
- **Fallback Options**: Alternative computation methods if needed

## Technical Implementation

### Data Loading
```typescript
// Load population data from static files
const lifeTable = await loadLifeTable();
const causeFractions = await loadCauseFractions();
const hrPriors = await loadHRPriors();
```

### Computation
```typescript
// All computation happens in browser
const result = await estimate(profile, {
  bootstrapSamples: 200,
  includeUncertainty: true
});
```

### Storage
```typescript
// Local storage only
localStorage.setItem('userProfile', JSON.stringify(profile));
```

## Privacy Benefits

### Data Minimization
- **No Collection**: We don't collect personal data
- **No Storage**: No server-side data storage
- **No Sharing**: No data sharing with third parties
- **No Selling**: No data monetization

### User Control
- **Local Control**: Users control their own data
- **Deletion**: Users can clear browser data
- **Transparency**: Clear about what data is used
- **Consent**: No consent needed since no data collection

### Regulatory Compliance
- **GDPR**: No personal data processing
- **CCPA**: No personal information collection
- **HIPAA**: No health information transmission
- **COPPA**: No data collection from children

## Performance Optimization

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Load components on demand
- **Compression**: Compress static assets
- **Caching**: Aggressive browser caching

### Computation Optimization
- **Memoization**: Cache calculation results
- **Parallel Processing**: Use Web Workers for heavy computation
- **Lazy Loading**: Load data files on demand
- **Progressive Enhancement**: Show results as they're calculated

## Monitoring and Analytics

### Optional Analytics
- **Opt-In**: Analytics are opt-in only
- **Differential Privacy**: Add noise to aggregated data
- **No Personal Data**: No individual user data
- **Local Processing**: Analytics processed locally

### Performance Monitoring
- **Computation Time**: Track calculation performance
- **Error Rates**: Monitor calculation failures
- **Browser Compatibility**: Track browser support
- **User Experience**: Monitor user interaction patterns

## Future Considerations

### Potential Changes
- **Server-Side Option**: Optional server-side computation
- **Edge Computing**: Computation at CDN edge
- **WebAssembly**: Faster computation with WASM
- **Progressive Web App**: Offline functionality

### Scalability
- **Data Updates**: Mechanism for updating population data
- **New Features**: Adding new risk factors or calculations
- **International**: Expanding to other countries
- **Advanced Models**: More sophisticated mortality models

---

**Date**: January 2025  
**Author**: Life Risk Estimator Team  
**Reviewers**: Privacy Team, Technical Team, Legal Team
