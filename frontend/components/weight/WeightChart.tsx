import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';

const Responsive = ResponsiveContainer as any;
const CChart = ComposedChart as any;
const CGrid = CartesianGrid as any;
const XAx = XAxis as any;
const YAx = YAxis as any;
const TTip = Tooltip as any;
const Lgd = Legend as any;
const Ref = ReferenceLine as any;
const Lne = Line as any;
const Brsh = Brush as any;
const BrBar = Bar as any;

interface WeightChartProps {
  data: any[];
  showBodyFat?: boolean;
  showMuscle?: boolean;
  showBMI?: boolean;
  height?: number;
  targetWeight?: number;
  className?: string;
}

const WeightChart: React.FC<WeightChartProps> = ({
  data,
  showBodyFat = false,
  showMuscle = false,
  showBMI = false,
  height = 400,
  targetWeight,
  className = ''
}) => {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((entry) => ({
      date: new Date(entry.measuredAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: new Date(entry.measuredAt),
      weight: entry.weight?.value || 0,
      bodyFat: entry.bodyFat?.percentage || null,
      muscleMass: entry.muscleMass?.value || null,
      waterPercentage: entry.waterPercentage || null,
      bmi: entry.bmi || null,
      notes: entry.notes || ''
    })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          
          {payload.map((entry: any, index: number) => {
            let value = entry.value;
            let unit = '';
            let color = entry.color;
            
            switch (entry.dataKey) {
              case 'weight':
                unit = 'kg';
                break;
              case 'bodyFat':
                unit = '%';
                break;
              case 'muscleMass':
                unit = 'kg';
                break;
              case 'waterPercentage':
                unit = '%';
                break;
              case 'bmi':
                unit = '';
                break;
            }
            
            return (
              <div key={index} className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {entry.dataKey.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {typeof value === 'number' ? value.toFixed(1) : value} {unit}
                </span>
              </div>
            );
          })}
          
          {data.notes && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">{data.notes}</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Calculate weight change
  const weightChange = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const firstWeight = chartData[0].weight;
    const lastWeight = chartData[chartData.length - 1].weight;
    const change = lastWeight - firstWeight;
    
    return {
      absolute: change,
      percentage: ((change / firstWeight) * 100),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [chartData]);

  // Get BMI category color
  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#3B82F6'; // Blue - Underweight
    if (bmi < 25) return '#10B981'; // Green - Normal
    if (bmi < 30) return '#F59E0B'; // Yellow - Overweight
    return '#EF4444'; // Red - Obese
  };

  if (!chartData.length) {
    return (
      <div className={`flex items-center justify-center h-${height/4} bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No weight data</h3>
          <p className="mt-1 text-sm text-gray-500">Add some weight entries to see your progress chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
          {weightChange && (
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600 mr-2">
                {chartData.length} entries over {Math.ceil((chartData[chartData.length - 1].fullDate.getTime() - chartData[0].fullDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                weightChange.trend === 'up' ? 'bg-red-100 text-red-800' :
                weightChange.trend === 'down' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {weightChange.trend === 'up' ? '↑' : weightChange.trend === 'down' ? '↓' : '→'}
                {Math.abs(weightChange.absolute).toFixed(1)}kg ({Math.abs(weightChange.percentage).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-gray-600">Weight</span>
          </div>
          {showBodyFat && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-gray-600">Body Fat</span>
            </div>
          )}
          {showMuscle && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span className="text-gray-600">Muscle Mass</span>
            </div>
          )}
          {showBMI && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-gray-600">BMI</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <Responsive width="100%" height={height}>
        <CChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAx 
            dataKey="date" 
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
          />
          <YAx 
            yAxisId="weight"
            domain={['dataMin - 2', 'dataMax + 2']}
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
          />
          {(showBodyFat || showBMI) && (
            <YAx 
              yAxisId="percentage"
              orientation="right"
              domain={[0, 50]}
              stroke="#666"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#ccc' }}
            />
          )}
          
          <TTip content={<CustomTooltip />} />
          <Lgd />

          {/* Target weight reference line */}
          {targetWeight && (
            <Ref 
              y={targetWeight} 
              stroke="#10B981" 
              strokeDasharray="5 5"
              yAxisId="weight"
              label={{ value: "Target", position: "insideTopRight" }}
            />
          )}

          {/* Weight line */}
          <Lne
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3B82F6' }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
            connectNulls={false}
            name="Weight (kg)"
          />

          {/* Body fat line */}
          {showBodyFat && (
            <Lne
              yAxisId="percentage"
              type="monotone"
              dataKey="bodyFat"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#EF4444' }}
              connectNulls={false}
              name="Body Fat (%)"
            />
          )}

          {/* Muscle mass bars */}
          {showMuscle && (
            <BrBar
              yAxisId="weight"
              dataKey="muscleMass"
              fill="#8B5CF6"
              opacity={0.6}
              name="Muscle Mass (kg)"
            />
          )}

          {/* BMI line */}
          {showBMI && (
            <Lne
              yAxisId="percentage"
              type="monotone"
              dataKey="bmi"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#F59E0B' }}
              connectNulls={false}
              name="BMI"
            />
          )}

          {/* Brush for zooming */}
          {chartData.length > 10 && (
            <Brsh 
              dataKey="date" 
              height={30} 
              stroke="#3B82F6"
              fill="#f8fafc"
            />
          )}
        </CChart>
      </Responsive>

      {/* BMI Categories Reference */}
      {showBMI && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">BMI Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Underweight (&lt;18.5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Normal (18.5-24.9)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Overweight (25-29.9)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Obese (≥30)</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Show:</span>
        <label className="inline-flex items-center text-sm">
          <input type="checkbox" checked={showBodyFat} readOnly className="mr-1" />
          Body Fat %
        </label>
        <label className="inline-flex items-center text-sm">
          <input type="checkbox" checked={showMuscle} readOnly className="mr-1" />
          Muscle Mass
        </label>
        <label className="inline-flex items-center text-sm">
          <input type="checkbox" checked={showBMI} readOnly className="mr-1" />
          BMI
        </label>
      </div>
    </div>
  );
};

export default WeightChart;
