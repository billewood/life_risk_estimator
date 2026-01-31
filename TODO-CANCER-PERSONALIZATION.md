# TODO: Personalized Cancer Risk Calculation

## Overview
Implement personalized cancer risk adjustments based on lifestyle and environmental factors.

## Current Status
- ✅ UI form created on `/cancer` page to collect risk factors
- ⏳ Backend calculation logic NOT YET IMPLEMENTED
- ⏳ Relative risk data NOT YET COMPILED

## Inputs Collected (in UI)
- Smoking status (never/former/current) + pack-years
- Alcohol consumption (drinks/week)
- BMI
- Red meat servings/week
- Processed meat servings/week
- Exercise hours/week
- Sun exposure level
- Family history (breast, colorectal, lung, prostate, ovarian, pancreatic, melanoma)

---

## Suggested Implementation Approaches

### Approach 1: Relative Risk Multipliers (Simpler)
Apply evidence-based relative risk (RR) multipliers to each cancer type based on risk factors.

**Example:**
- Smoking 20+ pack-years → Lung cancer RR = 15-30x, Bladder RR = 3x, Pancreatic RR = 2x
- BMI 30+ → Colorectal RR = 1.3x, Breast (postmenopausal) RR = 1.4x, Liver RR = 1.5x
- Alcohol 14+ drinks/week → Liver RR = 2x, Breast RR = 1.5x, Colorectal RR = 1.3x

**Data Sources:**
- IARC Monographs on carcinogen classification
- American Cancer Society cancer prevention guidelines
- UK Biobank studies on lifestyle factors
- WCRF/AICR Diet and Cancer Report

**Pros:** Straightforward to implement, well-documented RRs available
**Cons:** Doesn't account for interactions between factors

---

### Approach 2: Validated Risk Models (More Accurate)
Use published, validated risk prediction models for specific cancers.

**Available Models:**
| Cancer | Model | Link |
|--------|-------|------|
| Lung | PLCOm2012 | [Link](https://www.cancer.gov/types/lung/research/plco-trial) |
| Breast | Gail Model / Tyrer-Cuzick | [Link](https://bcrisktool.cancer.gov/) |
| Colorectal | QCancer | [Link](https://qcancer.org/) |
| Melanoma | Various | Based on UV exposure, skin type, moles |

**Pros:** Clinically validated, accurate for specific populations
**Cons:** Requires implementing multiple different models, some need more inputs

---

### Approach 3: Hybrid (Recommended)
1. Use validated models for major cancers where available (lung, breast, colorectal)
2. Use RR multipliers for other cancers
3. Aggregate into personalized pie chart

---

## Key Data to Compile

### Smoking
| Cancer | Never RR | Former RR | Current RR | Notes |
|--------|----------|-----------|------------|-------|
| Lung | 1.0 | 4-5x | 15-30x | Varies by pack-years |
| Bladder | 1.0 | 1.5x | 3x | |
| Pancreatic | 1.0 | 1.2x | 2x | |
| Kidney | 1.0 | 1.3x | 1.5x | |

### Alcohol (per 10g/day increase ≈ 1 drink)
| Cancer | RR per drink/day |
|--------|------------------|
| Breast | 1.07-1.10 |
| Colorectal | 1.07 |
| Liver | 1.10-1.30 |
| Esophageal | 1.30 |

### Obesity (BMI 30+ vs normal)
| Cancer | RR |
|--------|-----|
| Endometrial | 2-4x |
| Esophageal (adenocarcinoma) | 2x |
| Colorectal | 1.3x |
| Postmenopausal breast | 1.4x |
| Kidney | 1.5x |
| Pancreatic | 1.5x |
| Liver | 1.5-2x |

### Processed Meat (per 50g/day)
| Cancer | RR |
|--------|-----|
| Colorectal | 1.18 |

### Family History (first-degree relative)
| Cancer | RR |
|--------|-----|
| Breast | 1.8-2.0x |
| Colorectal | 2-4x |
| Ovarian | 3x |
| Prostate | 2x |

---

## Implementation Steps

1. **Compile relative risk database** (`backend/data_sources/cancer_relative_risks.json`)
   - Include source citations
   - Include confidence intervals where available
   
2. **Create cancer risk calculation function** (`backend/calculators/cancer_risk_calculator.py`)
   - Input: baseline cancer risks + user factors
   - Output: adjusted cancer type breakdown
   
3. **Add API endpoint** or extend existing `/api/calculate-risk`
   - Accept cancer-specific risk factors
   - Return personalized cancer breakdown
   
4. **Update frontend**
   - Call API when user enters factors
   - Update pie chart dynamically
   - Show comparison: "Your risk vs. Average"

---

## Priority Order
1. Smoking (biggest impact - lung cancer is #1 killer)
2. Family history (big impact, easy to implement)
3. BMI/obesity
4. Alcohol
5. Diet (red/processed meat)
6. Exercise
7. Sun exposure

---

## Resources
- [American Cancer Society - Cancer Prevention](https://www.cancer.org/healthy/eat-healthy-get-active/acs-guidelines-nutrition-physical-activity-cancer-prevention.html)
- [WCRF Cancer Prevention Recommendations](https://www.wcrf.org/diet-activity-and-cancer/cancer-prevention-recommendations/)
- [CDC - Cancer Risk Factors](https://www.cdc.gov/cancer/risk-factors/)
- [UK Biobank Studies](https://www.ukbiobank.ac.uk/)
