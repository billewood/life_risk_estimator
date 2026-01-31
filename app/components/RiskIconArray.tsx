'use client';

interface RiskIconArrayProps {
  probability: number; // 0-1 scale (e.g., 0.023 = 2.3%)
  title?: string;
  subtitle?: string;
  total?: number; // Default 100
}

// Simple person icon as SVG path
const PersonIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 32"
    className={`w-3 h-4 ${filled ? 'text-red-500' : 'text-gray-300'}`}
    fill="currentColor"
  >
    {/* Head */}
    <circle cx="12" cy="5" r="4" />
    {/* Body */}
    <path d="M12 10 L12 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Arms */}
    <path d="M5 14 L19 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Legs */}
    <path d="M12 20 L6 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 20 L18 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function RiskIconArray({
  probability,
  title = "1-Year Mortality Risk",
  subtitle,
  total = 100,
}: RiskIconArrayProps) {
  // Calculate how many icons should be filled
  const filledCount = Math.round(probability * total);
  const percentage = (probability * 100).toFixed(2);
  
  // Create array of 100 icons
  const icons = Array.from({ length: total }, (_, i) => i < filledCount);
  
  // Arrange in 10x10 grid
  const rows = 10;
  const cols = 10;

  return (
    <div className="w-full">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {/* Main visualization */}
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Icon grid */}
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: '280px'
          }}
        >
          {icons.map((filled, index) => (
            <div key={index} className="flex justify-center">
              <PersonIcon filled={filled} />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 flex items-center justify-center">
              <PersonIcon filled={true} />
            </div>
            <span className="text-gray-700">
              <span className="font-semibold text-red-600">{filledCount}</span> will die
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-4 flex items-center justify-center">
              <PersonIcon filled={false} />
            </div>
            <span className="text-gray-700">
              <span className="font-semibold">{total - filledCount}</span> will survive
            </span>
          </div>
        </div>

        {/* Percentage callout */}
        <div className="mt-3 text-center">
          <p className="text-gray-600">
            Of <span className="font-semibold">100 people like you</span>,{' '}
            <span className="font-bold text-red-600">{filledCount}</span>{' '}
            {filledCount === 1 ? 'is' : 'are'} expected to die in the next year
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ({percentage}% mortality risk)
          </p>
        </div>
      </div>
    </div>
  );
}
