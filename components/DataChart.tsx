import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { PivotConfig, PivotResult } from '../types';
import { calculatePivot } from '../services/dataService';
import { PieChart, Activity } from 'lucide-react';

interface DataChartProps {
  data: any[];
  config: PivotConfig;
}

const DataChart: React.FC<DataChartProps> = ({ data, config }) => {
  const result: PivotResult = useMemo(() => calculatePivot(data, config), [data, config]);
  
  // Transform PivotResult into Recharts friendly format
  const chartData = useMemo(() => {
    return result.rowKeys.map(rowKey => {
      const item: any = { name: rowKey };
      result.colKeys.forEach(colKey => {
        item[colKey] = result.matrix[rowKey][colKey] || 0;
      });
      item['Total'] = result.rowTotals[rowKey] || 0;
      return item;
    });
  }, [result]);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];

  if (chartData.length === 0) {
    return (
        <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-300 rounded-lg m-4">
            No data to visualize
        </div>
    );
  }

  const ChartComponent = chartData.length > 20 ? AreaChart : BarChart;
  const DataComponent = chartData.length > 20 ? Area : Bar;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-slate-100 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-700">Visualization</h3>
      </div>
      <div className="flex-1 w-full min-h-[250px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            {result.colKeys.length > 0 ? (
                result.colKeys.map((key, index) => (
                    <DataComponent 
                        key={key} 
                        type="monotone" 
                        dataKey={key} 
                        stackId={config.colField ? "a" : undefined}
                        fill={colors[index % colors.length]} 
                        stroke={colors[index % colors.length]}
                        fillOpacity={0.8}
                    />
                ))
            ) : (
                <DataComponent 
                    dataKey="Total" 
                    fill="#3b82f6" 
                    stroke="#3b82f6" 
                    fillOpacity={0.8} 
                />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataChart;