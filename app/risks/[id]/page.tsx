'use client';

import { useRouter, useParams } from 'next/navigation';

// Risk information database
const riskInfo: Record<string, {
  title: string;
  color: string;
  bgGradient: string;
  annualDeaths: string;
  description: string;
  facts: string[];
  prevention: string[];
  imageDescription?: string;
}> = {
  overdose: {
    title: 'Drug Overdose & Poisoning',
    color: 'red',
    bgGradient: 'from-red-50 to-orange-50',
    annualDeaths: '~107,000',
    description: 'Drug overdoses have become the leading cause of accidental death in the United States, surpassing car accidents. The majority are caused by synthetic opioids like fentanyl, but poisonings also include accidental ingestion of toxic substances.',
    facts: [
      'Fentanyl is involved in over 70% of overdose deaths',
      'Overdose deaths increased 500% from 1999 to 2022',
      'Many overdoses involve multiple substances',
      'Death cap mushrooms (Amanita phalloides) cause 90% of mushroom poisoning deaths',
      'Carbon monoxide poisoning kills ~400 Americans annually'
    ],
    prevention: [
      'Never take prescription opioids differently than prescribed',
      'Carry naloxone (Narcan) if you or someone you know uses opioids',
      'Test drugs with fentanyl test strips if using substances',
      'Never mix opioids with alcohol or benzodiazepines',
      'Install carbon monoxide detectors in your home',
      'Never eat wild mushrooms unless identified by an expert',
      'Keep medications locked away from children',
      'Dispose of unused medications properly'
    ],
    imageDescription: 'Death cap mushroom (Amanita phalloides) - responsible for most fatal mushroom poisonings'
  },
  motor_vehicle: {
    title: 'Motor Vehicle Accidents',
    color: 'orange',
    bgGradient: 'from-orange-50 to-amber-50',
    annualDeaths: '~43,000',
    description: 'Motor vehicle crashes remain a leading cause of death, particularly for younger Americans. While vehicle safety has improved dramatically, distracted driving and speeding continue to claim lives.',
    facts: [
      'Seat belts reduce fatal injury risk by 45%',
      'Drunk driving causes about 30% of traffic deaths',
      'Distracted driving kills over 3,000 people annually',
      'Motorcyclists are 29x more likely to die per mile traveled',
      'Rural roads account for 46% of traffic deaths despite less traffic'
    ],
    prevention: [
      'Always wear your seat belt',
      'Never drive under the influence of alcohol or drugs',
      'Put your phone away while driving',
      'Follow speed limits, especially on rural roads',
      'Wear a helmet when riding motorcycles or bicycles',
      'Avoid driving when drowsy',
      'Maintain your vehicle properly (brakes, tires, lights)',
      'Take a defensive driving course'
    ]
  },
  firearm: {
    title: 'Firearm Deaths',
    color: 'gray',
    bgGradient: 'from-gray-50 to-slate-50',
    annualDeaths: '~48,000',
    description: 'Firearm deaths include suicides (54%), homicides (43%), and accidents (3%). Having a firearm in the home significantly increases the risk of both suicide and homicide for household members.',
    facts: [
      'Suicide accounts for more than half of all firearm deaths',
      'Access to a firearm triples the risk of death by suicide',
      'Firearms in the home increase homicide risk 2-3x',
      'Most gun deaths occur in the home',
      'Safe storage reduces child gun deaths by 78%'
    ],
    prevention: [
      'If you own firearms, store them locked and unloaded',
      'Store ammunition separately from firearms',
      'Consider temporary off-site storage during mental health crises',
      'Use cable locks or gun safes',
      'Talk to family members about firearm safety',
      'If experiencing suicidal thoughts, ask someone to hold your firearms',
      'Take a firearm safety course',
      'Know the signs of depression and suicidal ideation'
    ]
  },
  falls: {
    title: 'Falls',
    color: 'amber',
    bgGradient: 'from-amber-50 to-yellow-50',
    annualDeaths: '~44,000',
    description: 'Falls are the leading cause of injury death for Americans over 65. However, falls from ladders and heights also significantly impact working-age adults, particularly in construction.',
    facts: [
      'One in four older adults falls each year',
      'Falls are the #1 cause of traumatic brain injury in older adults',
      'Ladder falls cause 300+ deaths and 164,000 ER visits annually',
      'Hip fractures are particularly deadly - 20% die within a year',
      'Fall risk increases with age, medications, and chronic conditions'
    ],
    prevention: [
      'Exercise regularly to improve balance and strength',
      'Have your vision checked annually',
      'Review medications with your doctor (some cause dizziness)',
      'Remove tripping hazards from your home',
      'Install grab bars in bathrooms',
      'Use proper technique and equipment when using ladders',
      'Wear proper footwear',
      'Consider a fall risk assessment if over 65'
    ]
  },
  suffocation: {
    title: 'Suffocation & Choking',
    color: 'purple',
    bgGradient: 'from-purple-50 to-indigo-50',
    annualDeaths: '~18,000',
    description: 'Suffocation deaths include choking on food or objects, accidental strangulation, and smothering. Choking is particularly dangerous for young children and older adults.',
    facts: [
      'Choking is the 4th leading cause of unintentional injury death',
      'Hot dogs, grapes, and nuts are common choking hazards for children',
      'Older adults choke more often due to swallowing difficulties',
      'Most choking deaths in adults involve food',
      'Infant suffocation often involves soft bedding'
    ],
    prevention: [
      'Cut food into small pieces for young children',
      'Avoid giving round foods (grapes, hot dogs) to children under 4',
      'Chew food thoroughly, especially meat',
      'Avoid talking or laughing while eating',
      'Learn the Heimlich maneuver',
      'Follow safe sleep guidelines for infants (no soft bedding)',
      'Keep plastic bags and cords away from children'
    ]
  },
  drowning: {
    title: 'Drowning',
    color: 'blue',
    bgGradient: 'from-blue-50 to-cyan-50',
    annualDeaths: '~4,000',
    description: 'Drowning can happen in seconds and is often silent. While pools are a major risk, natural water bodies like lakes, rivers, and oceans account for many drowning deaths.',
    facts: [
      'Drowning is the #1 cause of death for children ages 1-4',
      'Most child drownings occur during brief lapses in supervision',
      '50% of drownings occur within 25 yards of safety',
      'Alcohol is involved in up to 70% of adult drownings',
      'Drowning can happen in as little as 2 inches of water'
    ],
    prevention: [
      'Never swim alone',
      'Install four-sided fencing around pools',
      'Designate a water watcher when children are near water',
      'Learn to swim and teach your children',
      'Avoid alcohol when swimming or boating',
      'Wear life jackets on boats',
      'Learn CPR',
      'Never leave young children unattended near any water'
    ]
  },
  fire: {
    title: 'Fire & Burns',
    color: 'red',
    bgGradient: 'from-red-50 to-pink-50',
    annualDeaths: '~3,500',
    description: 'House fires and burns claim thousands of lives annually. Smoke inhalation, not burns, is the primary cause of death in fires. Working smoke alarms dramatically reduce fire death risk.',
    facts: [
      'Working smoke alarms reduce fire death risk by 50%',
      'Cooking is the leading cause of home fires',
      'Smoking materials cause the most fire deaths',
      'Most fatal fires occur at night when people are sleeping',
      'Space heaters cause 43% of home heating fires'
    ],
    prevention: [
      'Install smoke alarms on every level and test monthly',
      'Replace smoke alarm batteries annually',
      'Never leave cooking unattended',
      'Keep space heaters 3 feet from anything flammable',
      'Have a fire escape plan and practice it',
      "Don't smoke indoors, especially in bed",
      'Keep fire extinguishers accessible',
      'Never overload electrical outlets'
    ]
  },
  other: {
    title: 'Other Accidents',
    color: 'gray',
    bgGradient: 'from-gray-50 to-zinc-50',
    annualDeaths: '~15,000',
    description: 'This category includes various other accidental deaths such as machinery accidents, electrocution, natural/environmental causes, and other unintentional injuries.',
    facts: [
      'Occupational accidents kill about 5,000 workers annually',
      'Lightning strikes kill about 20 Americans per year',
      'Dog attacks cause 30-50 deaths annually',
      'Electrocution causes about 1,000 deaths per year',
      'Heat-related deaths are increasing with climate change'
    ],
    prevention: [
      'Follow workplace safety protocols',
      'Use proper protective equipment for hazardous tasks',
      'Seek shelter during thunderstorms',
      'Stay hydrated during hot weather',
      'Be cautious around unfamiliar animals',
      'Hire professionals for electrical work',
      'Know your physical limits when doing manual labor',
      'Take breaks during strenuous activities'
    ]
  }
};

export default function RiskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const risk = riskInfo[id];
  
  if (!risk) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Risk Not Found</h1>
          <button
            onClick={() => router.push('/other-risks')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to External Risks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${risk.bgGradient}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/other-risks')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to External Risks
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`bg-${risk.color}-100 rounded-full p-3 mr-4`}>
              <svg className={`w-8 h-8 text-${risk.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{risk.title}</h1>
              <p className="text-gray-600">{risk.annualDeaths} deaths per year in the U.S.</p>
            </div>
          </div>

          <p className="text-gray-700">{risk.description}</p>
        </div>

        {/* Image placeholder for poisoning */}
        {id === 'overdose' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🍄</div>
              <p className="text-green-100 text-sm italic">{risk.imageDescription}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Note: Never eat wild mushrooms unless positively identified by a mycology expert. 
              The death cap looks similar to edible mushrooms and has no antidote.
            </p>
          </div>
        )}

        {/* Key Facts */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Key Facts</h2>
          <ul className="space-y-2">
            {risk.facts.map((fact, index) => (
              <li key={index} className="flex items-start">
                <span className={`text-${risk.color}-500 mr-2`}>•</span>
                <span className="text-gray-700">{fact}</span>
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
            {risk.prevention.map((tip, index) => (
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
          <p>Data sources: CDC WISQARS, National Vital Statistics System</p>
        </div>
      </div>
    </div>
  );
}
