# Frontend Integration Guide

## 🎯 **Complete Risk Factor Schema for Frontend**

### **Overview**
The mortality calculator now provides a comprehensive risk factor schema that helps frontend developers understand exactly what risk factors to expect, their valid ranges, and how to format them for optimal user experience.

## 📋 **What's Available**

### **1. Risk Factor Schema API**
- **Endpoint**: `GET /api/schema`
- **Purpose**: Get complete field specifications, validation rules, and UI guidance
- **Response**: Complete schema with field types, ranges, options, and frontend hints

### **2. Validation API**
- **Endpoint**: `POST /api/schema/validation`
- **Purpose**: Validate user input against schema rules
- **Response**: Validation results with errors and warnings

### **3. Frontend Examples**
- **JavaScript Class**: `frontend_example.js` - Complete form generation and validation
- **HTML Demo**: `demo.html` - Working example with styling
- **Test Script**: `test_schema.py` - Schema demonstration

## 🔬 **Risk Factors Schema**

### **Required Fields**
| Field | Type | Range/Options | Description |
|-------|------|---------------|-------------|
| `age` | integer | 18-120 | Age in years |
| `sex` | string | male, female | Biological sex |
| `race` | string | white, black, african_american, other | Race/ethnicity for PCE |

### **Risk Factors**
| Field | Type | Range/Options | Default | Description |
|-------|------|---------------|---------|-------------|
| `smoking_status` | string | never, former, current | never | Current smoking status |
| `years_since_quit` | integer | 0-50 | 0 | Years since quitting (former smokers) |
| `systolic_bp` | number | 80-250 | 120 | Systolic blood pressure (mmHg) |
| `bp_treated` | boolean | true, false | false | Blood pressure medication |
| `bmi` | number | 15-60 | 22 | Body Mass Index (kg/m²) |
| `fitness_level` | string | sedentary, moderate, high | moderate | Physical activity level |
| `alcohol_pattern` | string | none, moderate, heavy, binge | none | Alcohol consumption pattern |
| `diabetes` | boolean | true, false | false | Diagnosed diabetes |
| `total_cholesterol` | number | 100-500 | 200 | Total cholesterol (mg/dL) |
| `hdl_cholesterol` | number | 20-150 | 50 | HDL cholesterol (mg/dL) |

## 🎨 **Frontend Guidance**

### **Form Organization**
The schema provides recommended form sections:

1. **Basic Information**: `age`, `sex`, `race`
2. **Lifestyle Factors**: `smoking_status`, `years_since_quit`, `fitness_level`, `alcohol_pattern`
3. **Medical Factors**: `systolic_bp`, `bp_treated`, `diabetes`, `bmi`
4. **Laboratory Values**: `total_cholesterol`, `hdl_cholesterol`

### **UI Recommendations**
| Field | Recommended Input | Notes |
|-------|------------------|-------|
| `age` | Number input with spinner | Min/max validation |
| `sex` | Radio buttons | Two options |
| `race` | Dropdown | Include "Other" option |
| `smoking_status` | Radio buttons with icons | Clear labels |
| `years_since_quit` | Number input (conditional) | Show only for former smokers |
| `systolic_bp` | Number input with mmHg label | Range validation |
| `bp_treated` | Checkbox | Medical emphasis |
| `bmi` | Number input with BMI calculator link | Help text provided |
| `fitness_level` | Radio buttons with descriptions | Activity level definitions |
| `alcohol_pattern` | Radio buttons with definitions | Clear consumption patterns |
| `diabetes` | Checkbox with medical emphasis | Diagnosis requirement |
| `total_cholesterol` | Number input with mg/dL label | Range validation |
| `hdl_cholesterol` | Number input with mg/dL label | Range validation |

### **Help Text Provided**
- **BMI**: "BMI = weight(kg) / height(m)² or use BMI calculator"
- **Fitness Level**: "Sedentary: <30 min/week, Moderate: 30-150 min/week, High: >150 min/week"
- **Alcohol Pattern**: "Moderate: 1-2 drinks/day, Heavy: >2 drinks/day, Binge: >4 drinks/occasion"

## 📡 **API Integration**

### **Request Format**
```json
{
  "age": 65,
  "sex": "male",
  "race": "white",
  "risk_factors": {
    "smoking_status": "current",
    "systolic_bp": 140,
    "bp_treated": false,
    "bmi": 28,
    "fitness_level": "sedentary",
    "alcohol_pattern": "heavy",
    "diabetes": false,
    "total_cholesterol": 220,
    "hdl_cholesterol": 40
  },
  "time_horizon": "1_year"
}
```

### **Response Format**
```json
{
  "success": true,
  "lifeExpectancy": 15,
  "oneYearMortality": 0.1349,
  "riskFactors": {},
  "causesOfDeath": [],
  "cardiovascularRisk": {
    "risk_10_year": 0.241,
    "risk_5_year": 0.145,
    "risk_1_year": 0.024,
    "risk_level": "High",
    "population": "white_male",
    "available": true
  },
  "metadata": {
    "baseline_risk": 0.0179,
    "risk_level": "High",
    "time_horizon": "1_year"
  }
}
```

## 🧪 **Validation Rules**

### **Range Validation**
- `age`: Must be 18-120 years
- `systolic_bp`: Must be 80-250 mmHg
- `bmi`: Must be 15-60 kg/m²
- `total_cholesterol`: Must be 100-500 mg/dL
- `hdl_cholesterol`: Must be 20-150 mg/dL

### **Conditional Fields**
- `years_since_quit`: Required only if `smoking_status` is "former"

### **Enum Validation**
- `sex`: Must be "male" or "female"
- `race`: Must be one of the specified options
- `smoking_status`: Must be "never", "former", or "current"
- `fitness_level`: Must be "sedentary", "moderate", or "high"
- `alcohol_pattern`: Must be "none", "moderate", "heavy", or "binge"

## 💻 **JavaScript Integration Example**

```javascript
// Load schema
const response = await fetch('/api/schema');
const schemaData = await response.json();
const schema = schemaData.schema;

// Generate form based on schema
function generateForm(schema) {
    // Use schema.frontend_guidance.form_organization.sections
    // Use schema.risk_factors for field specifications
    // Use schema.frontend_guidance.ui_recommendations for input types
}

// Validate user input
const validationResponse = await fetch('/api/schema/validation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_factors: userInput })
});

// Calculate risk
const riskResponse = await fetch('/api/calculate-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
});
```

## 🎯 **Key Benefits for Frontend**

### **1. Complete Field Specifications**
- All field types, ranges, and options defined
- Default values provided
- Help text and descriptions included

### **2. Built-in Validation**
- Range validation rules
- Type checking
- Conditional field logic
- Enum validation

### **3. UI Guidance**
- Recommended input types
- Form organization suggestions
- Help text and labels
- Accessibility considerations

### **4. Real-time Validation**
- API endpoint for validation
- Error messages and warnings
- Corrected values suggestions

### **5. Complete Integration**
- Working JavaScript examples
- HTML demo with styling
- API documentation
- Test scripts

## ✅ **Ready for Production**

The risk factor schema provides everything needed for frontend integration:

- ✅ **Complete field specifications**
- ✅ **Validation rules and API**
- ✅ **UI guidance and recommendations**
- ✅ **Working code examples**
- ✅ **Real-time validation**
- ✅ **Form generation helpers**
- ✅ **Error handling**
- ✅ **Accessibility support**

**The frontend can now build a complete, validated, user-friendly risk assessment form with confidence!**
