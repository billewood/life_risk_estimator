'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
  id?: string; // Optional ID for click handling
}

interface RiskPieChartProps {
  data: ChartDataItem[];
  title: string;
  subtitle?: string;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  height?: number;
  onSliceClick?: (item: ChartDataItem) => void;
  clickable?: boolean;
}

// Default color palette - modern, accessible colors
const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

const CustomTooltip = ({ active, payload, clickable }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-gray-600">
          {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}%
        </p>
        {clickable && (
          <p className="text-xs text-blue-500 mt-1">Click to explore →</p>
        )}
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // Don't show labels for slices < 5%
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function RiskPieChart({
  data,
  title,
  subtitle,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showLabels = true,
  height = 300,
  onSliceClick,
  clickable = false,
}: RiskPieChartProps) {
  // Ensure we have valid data
  const chartData = data.filter(item => item.value > 0);
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const handleClick = (data: any) => {
    if (onSliceClick && data) {
      onSliceClick(data);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomLabel : undefined}
            outerRadius={height / 3}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            onClick={clickable ? handleClick : undefined}
            style={clickable ? { cursor: 'pointer' } : undefined}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colors[index % colors.length]}
                stroke="white"
                strokeWidth={2}
                style={clickable ? { cursor: 'pointer' } : undefined}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip clickable={clickable} />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
              onClick={clickable ? (e) => {
                const item = chartData.find(d => d.name === e.value);
                if (item && onSliceClick) onSliceClick(item);
              } : undefined}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {clickable && (
        <p className="text-xs text-center text-gray-500 mt-2">Click on a section to explore in detail</p>
      )}
    </div>
  );
}
