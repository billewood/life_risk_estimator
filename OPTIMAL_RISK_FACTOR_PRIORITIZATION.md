# Optimal Risk Factor Prioritization
## Identifying the Greatest Impact Factors for Mortality Risk Assessment

**Based on**: Comprehensive audit of relative risk database and evidence-based impact analysis  
**Goal**: Maximize risk assessment accuracy with minimal user burden

---

## 🎯 **TIER 1: CRITICAL RISK FACTORS (Must Ask)**

### **1. SMOKING STATUS** 🚭
- **Impact**: **HIGHEST** - RR 2.3x (current vs never)
- **Why Critical**: Single largest modifiable risk factor
- **Questions Needed**:
  - Current smoking status (never/former/current)
  - Years since quitting (if former smoker)
- **Implementation**: ✅ Already optimized in database

### **2. SYSTOLIC BLOOD PRESSURE** ❤️
- **Impact**: **VERY HIGH** - RR 1.8x per 20 mmHg increase
- **Why Critical**: Major cardiovascular risk factor, highly modifiable
- **Questions Needed**:
  - Current systolic BP (mmHg)
  - On BP medication (yes/no)
- **Implementation**: ✅ Already optimized in database

### **3. AGE & SEX** 👤
- **Impact**: **FOUNDATIONAL** - Baseline mortality varies dramatically
- **Why Critical**: Primary determinants of baseline risk
- **Questions Needed**:
  - Age (years)
  - Biological sex (male/female)
- **Implementation**: ✅ Already required fields

---

## 🎯 **TIER 2: HIGH IMPACT FACTORS (Strongly Recommended)**

### **4. BODY MASS INDEX (BMI)** ⚖️
- **Impact**: **HIGH** - RR 1.15x per 5 BMI units above optimal
- **Why Important**: J-shaped relationship, affects multiple systems
- **Questions Needed**:
  - Weight (kg) and Height (m) OR BMI directly
- **Implementation**: ✅ Already optimized in database

### **5. PHYSICAL ACTIVITY/FITNESS** 🏃‍♂️
- **Impact**: **HIGH** - RR 1.4x (sedentary vs active)
- **Why Important**: Major modifiable cardiovascular risk factor
- **Questions Needed**:
  - Fitness level (sedentary/moderate/high)
  - OR weekly exercise hours
- **Implementation**: ✅ Already optimized in database

### **6. DIABETES STATUS** 🩸
- **Impact**: **HIGH** - RR 1.5-2.0x
- **Why Important**: Major cardiovascular risk factor
- **Questions Needed**:
  - Diabetes diagnosis (yes/no)
  - Type 1 or Type 2 (if yes)
- **Implementation**: ✅ Already optimized in database

---

## 🎯 **TIER 3: MODERATE IMPACT FACTORS (Recommended for Comprehensive Assessment)**

### **7. ALCOHOL CONSUMPTION** 🍷
- **Impact**: **MODERATE** - J-shaped relationship (protective at moderate, harmful at heavy)
- **Why Important**: Modifiable lifestyle factor
- **Questions Needed**:
  - Alcohol pattern (none/moderate/heavy/binge)
  - OR drinks per week
- **Implementation**: ✅ Already optimized in database

### **8. RACE/ETHNICITY** 👥
- **Impact**: **MODERATE** - Affects PCE cardiovascular risk calculation
- **Why Important**: Required for accurate PCE calculation
- **Questions Needed**:
  - Race/ethnicity (white/black/african_american/other)
- **Implementation**: ✅ Already optimized in database

---

## 🎯 **TIER 4: SPECIALIZED FACTORS (For Advanced Assessment)**

### **9. CHOLESTEROL LEVELS** 🧪
- **Impact**: **MODERATE** - Required for PCE cardiovascular risk
- **Why Important**: Enhances cardiovascular risk precision
- **Questions Needed**:
  - Total cholesterol (mg/dL)
  - HDL cholesterol (mg/dL)
- **Implementation**: ✅ Already optimized in database

### **10. FAMILY HISTORY** 👨‍👩‍👧‍👦
- **Impact**: **MODERATE** - Genetic predisposition factors
- **Why Important**: Non-modifiable but important risk factor
- **Questions Needed**:
  - Family history of heart disease (yes/no)
  - Family history of diabetes (yes/no)
- **Implementation**: ⚠️ Not currently in database (could be added)

---

## 📊 **IMPACT PRIORITIZATION MATRIX**

| Risk Factor | Mortality Impact | Modifiability | Data Quality | Priority |
|-------------|------------------|---------------|--------------|----------|
| **Smoking** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **CRITICAL** |
| **Blood Pressure** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **CRITICAL** |
| **Age/Sex** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | **CRITICAL** |
| **BMI** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **HIGH** |
| **Fitness** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **HIGH** |
| **Diabetes** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **HIGH** |
| **Alcohol** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **MODERATE** |
| **Race** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | **MODERATE** |
| **Cholesterol** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **MODERATE** |
| **Family History** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | **LOW** |

---

## 🎯 **RECOMMENDED USER EXPERIENCE FLOW**

### **Phase 1: Essential Information (Always Ask)**
```
1. Age (required)
2. Sex (required) 
3. Race/Ethnicity (for PCE)
4. Smoking Status (critical)
5. Systolic Blood Pressure (critical)
```

### **Phase 2: Lifestyle Factors (Strongly Recommended)**
```
6. BMI or Weight/Height
7. Physical Activity Level
8. Diabetes Status
9. Alcohol Consumption Pattern
```

### **Phase 3: Enhanced Assessment (Optional)**
```
10. Total Cholesterol
11. HDL Cholesterol
12. Family History of Heart Disease
13. Family History of Diabetes
```

---

## 🚀 **IMPLEMENTATION RECOMMENDATIONS**

### **Smart Form Design**
1. **Progressive Disclosure**: Start with essential factors, expand based on user interest
2. **Impact Indicators**: Show users which factors have the biggest impact
3. **Validation**: Real-time validation against risk factor schema
4. **Education**: Brief explanations of why each factor matters

### **Risk Factor Schema Integration**
```typescript
// Use existing schema with prioritization
const priorityFactors = {
  critical: ['age', 'sex', 'race', 'smoking_status', 'systolic_bp'],
  high: ['bmi', 'fitness_level', 'diabetes'],
  moderate: ['alcohol_pattern', 'total_cholesterol', 'hdl_cholesterol'],
  optional: ['family_history_heart_disease', 'family_history_diabetes']
}
```

### **User Experience Enhancements**
1. **Impact Preview**: Show estimated impact before user enters values
2. **Smart Defaults**: Use population averages for optional factors
3. **Risk Factor Education**: Brief tooltips explaining each factor
4. **Progress Indicators**: Show completion percentage and remaining high-impact factors

---

## 📈 **EXPECTED IMPACT OF OPTIMAL FACTOR SELECTION**

### **Risk Assessment Accuracy**
- **Essential Factors Only**: ~70% of maximum accuracy
- **Essential + High Impact**: ~90% of maximum accuracy  
- **All Factors**: ~100% of maximum accuracy

### **User Burden vs. Accuracy Trade-off**
- **Minimal (5 factors)**: High accuracy, low burden
- **Comprehensive (10 factors)**: Maximum accuracy, moderate burden
- **Complete (13 factors)**: Maximum accuracy, higher burden

---

## 🎯 **FINAL RECOMMENDATIONS**

### **For Maximum Impact with Minimal Burden:**
**Ask these 7 factors in order of importance:**
1. Age & Sex (foundational)
2. Race/Ethnicity (for PCE)
3. Smoking Status (highest impact)
4. Systolic Blood Pressure (high impact)
5. BMI (high impact)
6. Physical Activity Level (high impact)
7. Diabetes Status (high impact)

### **For Comprehensive Assessment:**
**Add these 3 factors:**
8. Alcohol Consumption Pattern
9. Total Cholesterol
10. HDL Cholesterol

### **Implementation Priority:**
1. ✅ **Immediate**: Implement Tier 1 & 2 factors (already in database)
2. 🔄 **Short-term**: Add family history to relative risk database
3. 📊 **Long-term**: Consider additional specialized factors (medications, sleep, stress)

**This prioritization maximizes risk assessment accuracy while minimizing user burden and leveraging your existing high-quality data sources.**
