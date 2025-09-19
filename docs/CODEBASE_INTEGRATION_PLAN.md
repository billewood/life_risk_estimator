# Codebase Integration Plan

## 🎯 **Recommended Approach: Unified Full-Stack Application**

### **Option 1: Move Frontend into Backend (RECOMMENDED)**
```
mortality_calculator/
├── backend/                    # Python backend (current structure)
│   ├── api/
│   ├── calculators/
│   ├── models/
│   ├── data_sources/
│   └── data_logger.py
├── frontend/                   # Next.js frontend
│   ├── app/
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── shared/                     # Shared types/utilities
│   ├── types/
│   └── utils/
├── docs/                       # All documentation
│   ├── README.md
│   ├── API_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
└── docker-compose.yml          # Full-stack deployment
```

### **Option 2: Keep Separate Repositories**
- `mortality-calculator-backend/` (Python)
- `mortality-calculator-frontend/` (Next.js)
- Use API communication between them

## 🏆 **Why Option 1 is Recommended**

### **Advantages**
✅ **Single Repository**: Easier to manage, version, and deploy
✅ **Shared Types**: TypeScript interfaces can be shared
✅ **Unified Documentation**: All docs in one place
✅ **Simplified Deployment**: One docker-compose setup
✅ **Better Development**: Frontend can import backend types
✅ **Real Data Integration**: No more placeholder data

### **Integration Benefits**
- Frontend can use the real risk factor schema
- Type-safe API communication
- Shared validation logic
- Unified error handling
- Single deployment pipeline

## 📋 **Migration Steps**

### **Step 1: Restructure Backend**
```bash
cd /Users/williamwood/Code/mortality_calculator
mkdir -p backend
mv api calculators models data_sources data_logger.py backend/
mv *.md docs/
```

### **Step 2: Move Frontend**
```bash
mv /Users/williamwood/Code/life-risk-app ./frontend
```

### **Step 3: Update Frontend to Use Real Backend**
- Replace placeholder API calls with real backend
- Use risk factor schema for form generation
- Implement real data validation
- Add comprehensive risk assessment UI

### **Step 4: Add Shared Types**
```typescript
// shared/types/api.ts
export interface RiskCalculationRequest {
  age: number
  sex: 'male' | 'female'
  race: 'white' | 'black' | 'african_american' | 'other'
  risk_factors: RiskFactors
  time_horizon?: '1_year' | '5_year' | '10_year'
}

export interface RiskFactors {
  smoking_status?: 'never' | 'former' | 'current'
  years_since_quit?: number
  systolic_bp?: number
  bp_treated?: boolean
  bmi?: number
  fitness_level?: 'sedentary' | 'moderate' | 'high'
  alcohol_pattern?: 'none' | 'moderate' | 'heavy' | 'binge'
  diabetes?: boolean
  total_cholesterol?: number
  hdl_cholesterol?: number
}

export interface RiskCalculationResponse {
  success: boolean
  lifeExpectancy: number
  oneYearMortality: number
  riskFactors: RiskFactorAdjustment[]
  causesOfDeath: CauseOfDeath[]
  cardiovascularRisk: CardiovascularRisk
  metadata: CalculationMetadata
  data_sources: DataSources
}
```

### **Step 5: Enhanced Frontend Features**
- **Dynamic Form Generation**: Use schema to build forms
- **Real-time Validation**: Use backend validation API
- **Comprehensive Results**: Show all risk calculations
- **Source Attribution**: Display data sources for transparency
- **Interactive Visualizations**: Charts and graphs for results

## 🚀 **Implementation Plan**

### **Phase 1: Basic Integration (1-2 days)**
1. Restructure directories
2. Update frontend to call real backend
3. Replace placeholder data with real calculations
4. Basic form with age, sex, race

### **Phase 2: Enhanced UI (2-3 days)**
1. Implement risk factor schema integration
2. Dynamic form generation
3. Real-time validation
4. Comprehensive results display

### **Phase 3: Advanced Features (3-4 days)**
1. Interactive visualizations
2. Source attribution display
3. Intervention modeling
4. Export functionality

### **Phase 4: Production Ready (2-3 days)**
1. Error handling and loading states
2. Responsive design optimization
3. Performance optimization
4. Deployment setup

## 📊 **Expected Outcome**

### **Unified Application Features**
- **Real Data**: 100% real data from authoritative sources
- **Comprehensive Risk Assessment**: All-cause mortality + cardiovascular risk
- **Dynamic Forms**: Generated from schema with validation
- **Source Transparency**: Every calculation traceable
- **Professional UI**: Modern, responsive, accessible
- **Type Safety**: Full TypeScript integration
- **Easy Deployment**: Single repository, unified deployment

### **Technical Benefits**
- **No Fake Data**: Complete compliance with evidence-based standards
- **Scalable Architecture**: Clean separation of concerns
- **Maintainable Code**: Shared types and utilities
- **Production Ready**: Error handling, validation, logging
- **Developer Friendly**: Clear structure, comprehensive docs

## 🎯 **Next Steps**

1. **Approve Integration Plan**: Confirm approach
2. **Start Migration**: Begin with directory restructuring
3. **Update Frontend**: Replace placeholder with real backend calls
4. **Enhance UI**: Implement schema-driven form generation
5. **Add Features**: Visualizations, source attribution, interventions
6. **Deploy**: Set up production deployment

**This approach will create a professional, evidence-based mortality risk calculator with a modern UI and complete data integrity.**
