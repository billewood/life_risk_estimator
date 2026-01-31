# Life Risk Calculator

A mortality and health risk calculator that provides personalized risk assessments using real data from authoritative sources.

**Live site:** https://billewood.com

## About

This calculator estimates your 1-year mortality risk and breaks down the most likely causes of death based on your age, sex, and lifestyle factors. It uses data from:

- **Social Security Administration Life Tables** - Official U.S. mortality data
- **CDC Cause of Death Data** - Leading causes of death by age/sex
- **AHA PREVENT Equations** - Cardiovascular disease risk prediction
- **Peer-reviewed literature** - Relative risk data for lifestyle factors

All calculations include source attribution so you can verify the data.

## Features

### Current Features

**Mortality Risk Assessment**
- 1-year mortality probability based on age and sex
- Adjustments for smoking, BMI, blood pressure, diabetes, alcohol, and fitness
- Visual representation with icon array (100 figures)
- Pie chart breakdown of most likely causes of death

**Cardiovascular Risk (AHA PREVENT)**
- 10-year and 30-year cardiovascular disease risk
- Requires blood pressure, cholesterol, and eGFR values
- Expandable calculator on the Heart Disease detail page

**Interactive Detail Pages**
- Click pie chart slices to explore specific risks
- Heart Disease page with PREVENT calculator
- Cancer page with breakdown by cancer type
- Accidents & Injuries page with external cause breakdown

**Cancer Information**
- Individual pages for each major cancer type (lung, breast, colorectal, etc.)
- Risk factors, symptoms, screening recommendations, and prevention tips
- Personalization form (calculation coming soon)

**External Risk Information**  
- Pages for drug overdose, motor vehicle accidents, falls, drowning, firearms, etc.
- Prevention strategies for each risk type

### Under Development

**Personalized Cancer Risk**
- UI form exists to collect smoking, alcohol, BMI, diet, exercise, family history
- Backend calculation using relative risk multipliers is not yet implemented
- Will use validated models (PLCOm2012 for lung, Gail for breast) where available

**Personalized External Risk**
- UI form exists for lifestyle factors (pool ownership, motorcycle use, firearm ownership, etc.)
- Backend calculation not yet implemented

**10-Year Mortality Projections**
- Currently only showing 1-year risk
- Need validated actuarial approach for multi-year projections

**PWA Support**
- Planning to add manifest and service worker for mobile app experience

## Data Sources

| Data | Source | Description |
|------|--------|-------------|
| Baseline mortality | SSA Life Tables 2021 | Official U.S. mortality by age/sex |
| Cause allocation | CDC WONDER | Cause of death percentages by age |
| Cardiovascular risk | AHA PREVENT (2024) | 10-year and 30-year CVD prediction |
| Smoking RR | Jha et al. 2013 | U.S.-specific relative risk 2.3x |
| BMI RR | Global Burden of Disease | U-shaped risk curve |
| Blood pressure RR | Meta-analyses | RR by BP category |
| Alcohol RR | Di Castelnuovo et al. | J-curve relationship |

## Technology

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python, Flask
- **Hosting:** Vercel (frontend), Render (backend)

## Privacy

This calculator does not store, retrieve, or track any personal information. All calculations happen in real-time and no data is saved.

## Contributing

Suggestions and feedback are welcome! Please open an issue on this repository.

This is a work in progress. All contributions should:
- Use only real data from authoritative sources
- Include source attribution for any new data
- Maintain scientific accuracy

## License

Research and educational use. Please cite original data sources when using results.
