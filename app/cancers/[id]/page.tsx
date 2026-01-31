'use client';

import { useRouter, useParams } from 'next/navigation';

// Cancer type information database
const cancerInfo: Record<string, {
  title: string;
  color: string;
  bgGradient: string;
  annualDeaths: string;
  survivalRate: string;
  description: string;
  riskFactors: string[];
  symptoms: string[];
  screening: string[];
  prevention: string[];
}> = {
  lung: {
    title: 'Lung & Bronchus Cancer',
    color: 'gray',
    bgGradient: 'from-gray-50 to-slate-50',
    annualDeaths: '~127,000',
    survivalRate: '25% (5-year)',
    description: 'Lung cancer is the leading cause of cancer death in the United States. About 80-90% of lung cancers are caused by smoking, but non-smokers can also develop lung cancer from secondhand smoke, radon, and other exposures.',
    riskFactors: [
      'Smoking (responsible for 80-90% of cases)',
      'Secondhand smoke exposure',
      'Radon gas in homes',
      'Asbestos and other occupational exposures',
      'Air pollution',
      'Family history of lung cancer',
      'Previous radiation therapy to the chest'
    ],
    symptoms: [
      'Persistent cough that worsens',
      'Coughing up blood',
      'Chest pain',
      'Shortness of breath',
      'Hoarseness',
      'Unexplained weight loss',
      'Bone pain or headaches (if spread)'
    ],
    screening: [
      'Low-dose CT scan annually for high-risk individuals',
      'Recommended for ages 50-80 with 20+ pack-year smoking history',
      'Current smokers or those who quit within past 15 years'
    ],
    prevention: [
      'Don\'t smoke - this is the single most important step',
      'If you smoke, quit - risk decreases over time after quitting',
      'Avoid secondhand smoke',
      'Test your home for radon (EPA recommends action at 4 pCi/L)',
      'Avoid carcinogens at work - use protective equipment',
      'Eat a diet rich in fruits and vegetables'
    ]
  },
  colorectal: {
    title: 'Colorectal Cancer',
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-50',
    annualDeaths: '~52,000',
    survivalRate: '65% (5-year)',
    description: 'Colorectal cancer affects the colon or rectum. It often begins as polyps that can be detected and removed during screening. When caught early, colorectal cancer is highly treatable.',
    riskFactors: [
      'Age over 45',
      'Family history of colorectal cancer or polyps',
      'Inflammatory bowel disease (Crohn\'s, ulcerative colitis)',
      'Diet high in red and processed meats',
      'Obesity and physical inactivity',
      'Smoking and heavy alcohol use',
      'Type 2 diabetes'
    ],
    symptoms: [
      'Change in bowel habits (diarrhea, constipation)',
      'Blood in stool or rectal bleeding',
      'Persistent abdominal discomfort',
      'Feeling that bowel doesn\'t empty completely',
      'Weakness or fatigue',
      'Unexplained weight loss'
    ],
    screening: [
      'Colonoscopy every 10 years starting at age 45',
      'FIT (stool test) annually as alternative',
      'CT colonography every 5 years',
      'Earlier/more frequent screening with family history'
    ],
    prevention: [
      'Get screened regularly - polyps can be removed before becoming cancer',
      'Maintain a healthy weight',
      'Exercise regularly (150+ minutes/week)',
      'Limit red meat and avoid processed meats',
      'Eat plenty of fiber, fruits, and vegetables',
      'Limit alcohol to 1-2 drinks per day',
      'Don\'t smoke'
    ]
  },
  pancreatic: {
    title: 'Pancreatic Cancer',
    color: 'purple',
    bgGradient: 'from-purple-50 to-violet-50',
    annualDeaths: '~50,000',
    survivalRate: '12% (5-year)',
    description: 'Pancreatic cancer has one of the lowest survival rates because it\'s often diagnosed at an advanced stage. The pancreas is deep in the body, so tumors can\'t be seen or felt during routine exams.',
    riskFactors: [
      'Smoking (doubles the risk)',
      'Obesity',
      'Type 2 diabetes (long-standing)',
      'Chronic pancreatitis',
      'Family history of pancreatic cancer',
      'Certain genetic syndromes (BRCA2, Lynch syndrome)',
      'Heavy alcohol use'
    ],
    symptoms: [
      'Jaundice (yellowing of skin and eyes)',
      'Dark urine and light-colored stools',
      'Upper abdominal pain radiating to back',
      'Loss of appetite and weight loss',
      'New-onset diabetes',
      'Blood clots',
      'Fatigue'
    ],
    screening: [
      'No routine screening for average-risk individuals',
      'High-risk individuals may get endoscopic ultrasound or MRI',
      'Genetic counseling for those with family history'
    ],
    prevention: [
      'Don\'t smoke',
      'Maintain a healthy weight',
      'Limit alcohol consumption',
      'Eat a healthy diet rich in fruits and vegetables',
      'Manage diabetes effectively',
      'Avoid exposure to industrial chemicals'
    ]
  },
  breast: {
    title: 'Breast Cancer',
    color: 'pink',
    bgGradient: 'from-pink-50 to-rose-50',
    annualDeaths: '~43,000',
    survivalRate: '91% (5-year)',
    description: 'Breast cancer is the most common cancer in women (excluding skin cancer) but can also occur in men. When detected early through screening, breast cancer has excellent survival rates.',
    riskFactors: [
      'Being female (100x more common than in men)',
      'Increasing age',
      'BRCA1/BRCA2 gene mutations',
      'Family history of breast cancer',
      'Dense breast tissue',
      'Early menstruation or late menopause',
      'Obesity after menopause',
      'Alcohol consumption',
      'Hormone replacement therapy'
    ],
    symptoms: [
      'Lump or thickening in breast or underarm',
      'Change in breast size or shape',
      'Dimpling or puckering of skin',
      'Nipple discharge (especially bloody)',
      'Nipple turning inward',
      'Redness or scaling of nipple or breast skin'
    ],
    screening: [
      'Mammogram every 1-2 years starting at age 40-50',
      'Earlier and more frequent for high-risk women',
      'MRI in addition to mammogram for very high-risk women',
      'Clinical breast exams as part of regular checkups'
    ],
    prevention: [
      'Maintain a healthy weight, especially after menopause',
      'Exercise regularly (4+ hours per week)',
      'Limit alcohol to less than 1 drink per day',
      'Breastfeed if possible',
      'Limit hormone therapy duration',
      'Consider risk-reducing medications if high-risk',
      'Genetic testing and counseling if family history'
    ]
  },
  prostate: {
    title: 'Prostate Cancer',
    color: 'blue',
    bgGradient: 'from-blue-50 to-cyan-50',
    annualDeaths: '~35,000',
    survivalRate: '97% (5-year)',
    description: 'Prostate cancer is the most common cancer in men. Most prostate cancers grow slowly and may not cause harm, leading to debates about screening. When aggressive, it can spread and become life-threatening.',
    riskFactors: [
      'Age (rare before 40, most common after 65)',
      'African American race (higher risk and mortality)',
      'Family history of prostate cancer',
      'BRCA1/BRCA2 gene mutations',
      'Obesity (linked to more aggressive disease)',
      'Diet high in red meat and dairy'
    ],
    symptoms: [
      'Often no symptoms in early stages',
      'Difficulty urinating or weak urine stream',
      'Frequent urination, especially at night',
      'Blood in urine or semen',
      'Erectile dysfunction',
      'Pain in hips, back, or chest (if spread)'
    ],
    screening: [
      'PSA blood test - discuss with doctor starting at 50 (or 45 for high-risk)',
      'Digital rectal exam',
      'Shared decision-making recommended due to overdiagnosis concerns'
    ],
    prevention: [
      'Maintain a healthy weight',
      'Exercise regularly',
      'Eat a diet rich in fruits and vegetables',
      'Limit red meat and high-fat dairy',
      'Consider discussing aspirin or finasteride with doctor if high-risk'
    ]
  },
  liver: {
    title: 'Liver Cancer',
    color: 'amber',
    bgGradient: 'from-amber-50 to-orange-50',
    annualDeaths: '~30,000',
    survivalRate: '21% (5-year)',
    description: 'Liver cancer often develops in people with chronic liver disease, particularly from hepatitis B/C infection or heavy alcohol use. It\'s one of the few cancers that\'s increasing in the United States.',
    riskFactors: [
      'Chronic hepatitis B or C infection',
      'Cirrhosis from any cause',
      'Heavy alcohol use',
      'Non-alcoholic fatty liver disease (NAFLD)',
      'Obesity and type 2 diabetes',
      'Aflatoxin exposure (contaminated food)',
      'Hemochromatosis (iron overload)'
    ],
    symptoms: [
      'Often no symptoms until advanced',
      'Unexplained weight loss',
      'Loss of appetite',
      'Upper abdominal pain',
      'Nausea and vomiting',
      'Jaundice',
      'Swelling in abdomen'
    ],
    screening: [
      'Ultrasound every 6 months for high-risk individuals',
      'AFP blood test may be used alongside ultrasound',
      'Recommended for those with cirrhosis or chronic hepatitis B'
    ],
    prevention: [
      'Get vaccinated for hepatitis B',
      'Get tested and treated for hepatitis C',
      'Limit alcohol consumption',
      'Maintain a healthy weight',
      'Avoid sharing needles',
      'Practice safe sex to prevent hepatitis transmission'
    ]
  },
  leukemia: {
    title: 'Leukemia',
    color: 'red',
    bgGradient: 'from-red-50 to-rose-50',
    annualDeaths: '~24,000',
    survivalRate: '66% (5-year)',
    description: 'Leukemia is cancer of the blood-forming tissues, including bone marrow. There are many types, some more aggressive than others. Unlike solid tumors, leukemia doesn\'t form a mass.',
    riskFactors: [
      'Previous chemotherapy or radiation',
      'Genetic disorders (Down syndrome)',
      'Exposure to benzene and certain chemicals',
      'Smoking',
      'Family history of leukemia',
      'Blood disorders like myelodysplastic syndrome'
    ],
    symptoms: [
      'Fatigue and weakness',
      'Frequent infections',
      'Easy bruising or bleeding',
      'Petechiae (tiny red spots on skin)',
      'Unexplained weight loss',
      'Swollen lymph nodes',
      'Bone pain or tenderness'
    ],
    screening: [
      'No routine screening for average-risk individuals',
      'Blood tests can detect abnormalities',
      'People with high-risk genetic conditions may be monitored'
    ],
    prevention: [
      'Avoid smoking',
      'Limit exposure to benzene and industrial chemicals',
      'Use protective equipment if working with chemicals',
      'Limit unnecessary radiation exposure'
    ]
  },
  lymphoma: {
    title: 'Non-Hodgkin Lymphoma',
    color: 'indigo',
    bgGradient: 'from-indigo-50 to-purple-50',
    annualDeaths: '~21,000',
    survivalRate: '74% (5-year)',
    description: 'Non-Hodgkin lymphoma is a cancer of the lymphatic system, which is part of the immune system. There are many subtypes with varying behaviors, from slow-growing to aggressive.',
    riskFactors: [
      'Age (most common after 60)',
      'Weakened immune system (HIV, transplant drugs)',
      'Autoimmune diseases',
      'Certain infections (EBV, H. pylori, hepatitis C)',
      'Exposure to certain chemicals (pesticides, benzene)',
      'Previous cancer treatment'
    ],
    symptoms: [
      'Painless swollen lymph nodes',
      'Fever and night sweats',
      'Unexplained weight loss',
      'Fatigue',
      'Abdominal pain or swelling',
      'Chest pain or coughing'
    ],
    screening: [
      'No routine screening for average-risk individuals',
      'Physical exam can detect swollen lymph nodes',
      'Biopsy required for diagnosis'
    ],
    prevention: [
      'Maintain a healthy immune system',
      'Treat infections that increase risk (H. pylori, hepatitis C)',
      'Limit exposure to pesticides and chemicals',
      'Practice safe sex to prevent HIV'
    ]
  },
  brain: {
    title: 'Brain & Nervous System Cancer',
    color: 'slate',
    bgGradient: 'from-slate-50 to-gray-50',
    annualDeaths: '~18,000',
    survivalRate: '36% (5-year)',
    description: 'Brain tumors can be cancerous (malignant) or non-cancerous (benign), but even benign tumors can cause serious problems. The causes of most brain cancers are unknown.',
    riskFactors: [
      'Previous radiation to the head',
      'Certain genetic conditions (neurofibromatosis, Li-Fraumeni)',
      'Family history of brain tumors',
      'Age (some types more common in children or older adults)',
      'Weakened immune system'
    ],
    symptoms: [
      'Headaches, especially in the morning',
      'Seizures',
      'Vision or hearing problems',
      'Balance and walking difficulties',
      'Personality or behavior changes',
      'Memory problems',
      'Nausea and vomiting'
    ],
    screening: [
      'No routine screening available',
      'Imaging (MRI, CT) used when symptoms present',
      'Genetic counseling for those with hereditary conditions'
    ],
    prevention: [
      'Limited known prevention methods',
      'Avoid unnecessary radiation exposure',
      'Genetic counseling if family history',
      'General healthy lifestyle may reduce risk'
    ]
  },
  other: {
    title: 'Other Cancers',
    color: 'gray',
    bgGradient: 'from-gray-50 to-zinc-50',
    annualDeaths: '~200,000',
    survivalRate: 'Varies by type',
    description: 'This category includes many other cancer types such as kidney, bladder, thyroid, melanoma, ovarian, uterine, stomach, and esophageal cancers. Each has its own risk factors and treatments.',
    riskFactors: [
      'Varies by cancer type',
      'Tobacco use affects many cancer types',
      'Obesity linked to 13 types of cancer',
      'UV exposure (melanoma)',
      'HPV infection (cervical, throat)',
      'Family history and genetic factors'
    ],
    symptoms: [
      'Varies widely by cancer type',
      'Unexplained weight loss',
      'Persistent fatigue',
      'Changes in skin',
      'Unusual bleeding or discharge',
      'Persistent pain'
    ],
    screening: [
      'Skin exams for melanoma',
      'Pap smears for cervical cancer',
      'Regular checkups for early detection',
      'Discuss individual risk with your doctor'
    ],
    prevention: [
      'Don\'t smoke',
      'Maintain a healthy weight',
      'Get HPV vaccine',
      'Protect skin from UV rays',
      'Limit alcohol',
      'Get recommended cancer screenings'
    ]
  }
};

export default function CancerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const cancer = cancerInfo[id];
  
  if (!cancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cancer Type Not Found</h1>
          <button
            onClick={() => router.push('/cancer')}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to Cancer Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cancer.bgGradient}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/cancer')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cancer Overview
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`bg-purple-100 rounded-full p-3 mr-4`}>
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cancer.title}</h1>
              <p className="text-gray-600">{cancer.annualDeaths} deaths/year in the U.S. • {cancer.survivalRate} survival</p>
            </div>
          </div>

          <p className="text-gray-700">{cancer.description}</p>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Factors
          </h2>
          <ul className="space-y-2">
            {cancer.riskFactors.map((factor, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-400 mr-2">•</span>
                <span className="text-gray-700">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Symptoms */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Warning Signs & Symptoms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cancer.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-start bg-yellow-50 rounded-lg p-2">
                <span className="text-yellow-500 mr-2">•</span>
                <span className="text-sm text-gray-700">{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screening */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Screening Recommendations
          </h2>
          <ul className="space-y-2">
            {cancer.screening.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prevention */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            How to Reduce Your Risk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cancer.prevention.map((tip, index) => (
              <div key={index} className="flex items-start bg-green-50 rounded-lg p-3">
                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="text-center text-sm text-gray-500">
          <p>Data sources: American Cancer Society, National Cancer Institute, CDC</p>
        </div>
      </div>
    </div>
  );
}
