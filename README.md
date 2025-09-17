# Life Risk Estimator

A privacy-preserving, educational web application that estimates life expectancy and mortality risk based on population data and published risk factors.

## ⚠️ Important Disclaimers

**This tool is for educational purposes only and is not medical advice.**

- Not intended for medical decisions, insurance underwriting, or employment screening
- Based on population data and statistical models
- Individual risk varies significantly from population averages
- Always consult healthcare providers for personalized medical advice

## Features

### Core Functionality
- **Life Expectancy Estimates** - Median life expectancy with 80% confidence intervals
- **1-Year Mortality Risk** - Probability of death within the next year
- **Cause Distribution** - Breakdown of likely causes of death
- **Risk Factor Analysis** - Impact of individual risk factors on mortality
- **Uncertainty Quantification** - Bootstrap confidence intervals for all estimates

### Privacy Protection
- **Client-Side Computation** - All calculations performed on your device
- **No Data Transmission** - Personal information never leaves your device
- **No Account Required** - Use without registration or login
- **Minimal Data Collection** - Only essential information for calculations

### Risk Factors
- Age and sex (baseline mortality)
- Geographic location (ZIP code for regional adjustment)
- Smoking status (never/former/current)
- Alcohol consumption (none/moderate/heavy)
- Physical activity (weekly minutes)
- BMI category (optional)
- Vaccination status (flu, COVID-19)

## Technical Architecture

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Recharts** - Data visualization

### Model Engine
- **Baseline Mortality** - US population life tables
- **Risk Adjustment** - Hazard ratios from published research
- **Survival Analysis** - Life expectancy calculations
- **Bootstrap Uncertainty** - Monte Carlo confidence intervals
- **Cause Distribution** - Competing risks modeling

### Data Sources
- **Life Tables** - CDC/SSA period life tables
- **Cause Fractions** - CDC WONDER mortality data
- **Risk Factors** - Meta-analyses and systematic reviews
- **Geographic Data** - County-level mortality differentials

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd life-risk-app

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
life-risk-app/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Global layout
│   ├── page.tsx           # Home page
│   └── results/           # Results page
├── components/            # React components
│   ├── forms/            # Input components
│   └── results/          # Results display
├── lib/                  # Core libraries
│   ├── model/            # Mathematical models
│   ├── data/             # Data loading and validation
│   └── math/             # Statistical utilities
├── state/                # State management
├── hooks/                # Custom React hooks
├── content/              # Static content and copy
├── data/                 # Static data files
└── tests/                # Test files
```

## Data Files

### Life Tables (`data/v2025-01/us_life_table.csv`)
- Age-specific mortality probabilities
- Remaining life expectancy by age and sex
- Based on US population data

### Cause Fractions (`data/v2025-01/cause_fractions.csv`)
- Distribution of causes of death by age and sex
- ICD-10 chapter groupings
- Based on CDC mortality data

### Hazard Ratio Priors (`data/v2025-01/hr_priors.csv`)
- Risk factor hazard ratios from literature
- Uncertainty estimates (log-normal distributions)
- Sources and confidence levels

## Model Methodology

### Baseline Mortality
1. Load age- and sex-specific mortality probabilities from life tables
2. Calculate baseline 1-year risk and life expectancy
3. Generate survival curves for life expectancy calculations

### Risk Adjustment
1. Apply hazard ratios for each risk factor
2. Combine risk factors multiplicatively
3. Adjust mortality probabilities and survival curves
4. Calculate confidence intervals via bootstrap sampling

### Cause Distribution
1. Load baseline cause fractions by age and sex
2. Apply risk factor tilts (smoking → respiratory/cancer, etc.)
3. Normalize to sum to adjusted mortality probability
4. Generate lifetime and 1-year cause distributions

### Uncertainty Analysis
1. Sample hazard ratios from log-normal distributions
2. Repeat calculations with sampled parameters
3. Calculate confidence intervals from bootstrap results
4. Assess convergence and Monte Carlo error

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Data Validation
```bash
npm run validate-data
```

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npx vercel

# Or connect GitHub repository for automatic deployments
```

### Other Platforms
- **Netlify** - Static site hosting
- **GitHub Pages** - Free static hosting
- **AWS S3 + CloudFront** - Scalable static hosting

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive tests
- Accessibility compliance

### Pull Request Process
1. Ensure all tests pass
2. Update documentation
3. Add appropriate disclaimers
4. Review for privacy implications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Data Sources**: CDC, SSA, published research
- **Risk Factors**: Meta-analyses and systematic reviews
- **Methodology**: Standard actuarial and epidemiological methods
- **Privacy**: Differential privacy and client-side computation techniques

## Support

### Issues and Questions
- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides and API docs
- **Community** - Discussion and support

### Crisis Resources
If you are experiencing thoughts of self-harm:
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

---

**Remember**: This tool is for educational purposes only. Always consult healthcare providers for medical advice.
