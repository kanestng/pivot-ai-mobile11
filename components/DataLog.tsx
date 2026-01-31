import React from 'react';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { DataRow } from '../types';

interface DataLogProps {
  data: DataRow[];
  headers: string[];
  onBack: () => void;
}

const DataLog: React.FC<DataLogProps> = ({ data, headers, onBack }) => {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 flex items-center gap-2 pr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800">Raw Data Log</h1>
                <p className="text-xs text-slate-500">{data.length} records found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-w-max inline-block min-w-full">
            <table className="min-w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
                <tr>
                    <th className="px-6 py-3 border-b border-slate-200 font-bold w-16 text-center text-slate-400">#</th>
                    {headers.map((header) => (
                        <th key={header} className="px-6 py-3 border-b border-slate-200 font-bold whitespace-nowrap">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 text-center text-xs font-mono">{idx + 1}</td>
                    {headers.map((header) => (
                    <td key={`${idx}-${header}`} className="px-6 py-3 text-slate-700 whitespace-nowrap">
                        {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
            
            {data.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    No data available.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DataLog;