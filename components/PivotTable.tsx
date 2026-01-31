import React, { useMemo } from 'react';
import { PivotConfig, PivotResult } from '../types';
import { calculatePivot } from '../services/dataService';

interface PivotTableProps {
  data: any[];
  config: PivotConfig;
}

const PivotTable: React.FC<PivotTableProps> = ({ data, config }) => {
  const result: PivotResult = useMemo(() => calculatePivot(data, config), [data, config]);
  
  // Format numbers nicely
  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  };

  const rowLabel = config.rowField.length > 0 ? config.rowField.join(' > ') : 'Total';

  return (
    <div className="flex-1 overflow-auto bg-white relative">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-3 border-b border-r border-slate-200 bg-slate-50 font-bold sticky left-0 z-20 min-w-[200px]">
              {rowLabel} / {config.colField || 'Values'}
            </th>
            {result.colKeys.map(colKey => (
              <th key={colKey} className="px-6 py-3 border-b border-slate-200 whitespace-nowrap text-right min-w-[100px]">
                {colKey}
              </th>
            ))}
            <th className="px-6 py-3 border-b border-l border-slate-200 bg-slate-100 text-slate-700 font-bold text-right min-w-[100px]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {result.rowKeys.map(rowKey => (
            <tr key={rowKey} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0">
              <td className="px-6 py-3 font-medium text-slate-900 border-r border-slate-200 bg-white sticky left-0 z-10 truncate max-w-[250px]" title={rowKey}>
                {rowKey}
              </td>
              {result.colKeys.map(colKey => (
                <td key={`${rowKey}-${colKey}`} className="px-6 py-3 text-right text-slate-600 tabular-nums">
                  {result.matrix[rowKey][colKey] !== undefined ? fmt(result.matrix[rowKey][colKey]) : '-'}
                </td>
              ))}
              <td className="px-6 py-3 font-semibold text-slate-800 text-right border-l border-slate-200 bg-slate-50 tabular-nums">
                {fmt(result.rowTotals[rowKey])}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 z-20 bg-slate-100 font-bold text-slate-800 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <tr>
            <td className="px-6 py-3 border-t border-r border-slate-300 sticky left-0 bg-slate-100 z-30">
              Grand Total
            </td>
            {result.colKeys.map(colKey => (
              <td key={`total-${colKey}`} className="px-6 py-3 border-t border-slate-300 text-right tabular-nums">
                {fmt(result.colTotals[colKey])}
              </td>
            ))}
            <td className="px-6 py-3 border-t border-l border-slate-300 text-right bg-slate-200 tabular-nums">
              {fmt(result.grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
      
      {result.rowKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <p>No data available for this configuration.</p>
        </div>
      )}
    </div>
  );
};

export default PivotTable;