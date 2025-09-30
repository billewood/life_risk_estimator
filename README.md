# Life Risk Estimator

A comprehensive mortality and cardiovascular risk calculator built with Next.js frontend and Python backend, using only real data from authoritative sources.

## 🎯 **Key Features**

- **Real Data Only**: No fake data, estimates, or placeholders anywhere
- **Evidence-Based**: All calculations use peer-reviewed literature and official government data
- **Automated-First**: Loads packaged data by default, with manual fallback if needed
- **Complete Attribution**: Every value traceable to original source with citations
- **Modern UI**: Responsive design with real-time validation

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Python 3.9+

### Installation
```bash
cd life-risk-app
npm install
npm run setup  # Installs Python dependencies
```

### Run Development
```bash
# Start both frontend and backend
npm run dev:fullstack

# Or start separately
npm run dev:backend  # Python backend on port 5000
npm run dev          # Next.js frontend on port 3000
```

Open http://localhost:3000

## 📊 **Data Sources**

The app uses **packaged data files** by default for reliability:

- **SSA Life Tables**: `backend/data_sources/ssa_life_tables_2021.csv`
- **CDC Cause Data**: `backend/data_sources/cdc_cause_death_2022.csv`  
- **GBD Risk Factors**: `backend/data_sources/gbd_risk_factors_2019.json`

### Data Updates
- **Default**: Uses packaged CSV/JSON files (no network required)
- **SSA Updates**: Set `force_download_ssa=True` to fetch latest from SSA website
- **Manual Fallback**: If packaged files missing, see `docs/DATA_DOWNLOAD_GUIDE.md`

## 🏗️ **Architecture**

```
life-risk-app/
├── app/                    # Next.js frontend
│   ├── api/calculate/     # API route (calls Python backend)
│   └── page.tsx           # Main UI
├── backend/               # Python backend
│   ├── data_sources/      # Packaged data files + acquisition logic
│   ├── calculators/       # Risk calculation engine
│   ├── models/           # Mortality models
│   └── api/              # Flask API server
└── shared/types/         # Shared TypeScript interfaces
```

## 🔬 **Risk Factors**

All relative risks sourced from peer-reviewed literature:

- **Smoking**: 2.3x current vs never (Jha et al. 2013, U.S.-specific)
- **Blood Pressure**: 1.8x per 20mmHg SBP (Lewington et al. 2002)
- **BMI**: 1.15x per 5 units (Global BMI Collaboration 2016)
- **Fitness**: 1.4x sedentary vs active (Warburton et al. 2006)
- **Alcohol**: J-shaped curve (Di Castelnuovo et al. 2006)

## 📡 **API Usage**

```javascript
const response = await fetch('/api/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 65,
    sex: 'male',
    race: 'white',
    risk_factors: {
      smoking_status: 'current',
      systolic_bp: 140,
      bmi: 28,
      fitness_level: 'sedentary'
    },
    time_horizon: '1_year'
  })
});
```

## 🧪 **Testing**

```bash
npm run test:backend  # Test Python backend
npm run lint          # Lint frontend code
```

## 📚 **Documentation**

- **Data Guide**: `docs/DATA_DOWNLOAD_GUIDE.md` - Manual data download instructions
- **API Reference**: Complete API documentation in `backend/api/`
- **Risk Factors**: Detailed source attribution in `backend/data_sources/`

## 🚀 **Deployment**

```bash
npm run build
npm run start
```

## 📄 **License**

Research and educational use. Please cite original data sources when using results.

---

**This is a production-ready, evidence-based mortality risk calculator with complete data integrity and modern user experience.**