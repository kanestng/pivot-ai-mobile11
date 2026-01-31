import React from 'react';
import { AggregatorType, PivotConfig } from '../types';
import { Settings, Database, Plus, X, LayoutTemplate } from 'lucide-react';

interface PivotControlsProps {
  headers: string[];
  numericHeaders: string[];
  config: PivotConfig;
  onChange: (newConfig: PivotConfig) => void;
}

const PivotControls: React.FC<PivotControlsProps> = ({ 
  headers, 
  numericHeaders, 
  config, 
  onChange 
}) => {
  
  const handleSingleChange = (field: keyof PivotConfig, value: string) => {
    // If value is "NONE" for colField, set to undefined
    const finalValue = value === "NONE" ? undefined : value;
    onChange({ ...config, [field]: finalValue });
  };

  const addRowField = (field: string) => {
    if (!field) return;
    const currentRows = config.rowField || [];
    if (!currentRows.includes(field)) {
      onChange({ ...config, rowField: [...currentRows, field] });
    }
  };

  const removeRowField = (fieldToRemove: string) => {
    const currentRows = config.rowField || [];
    onChange({ 
        ...config, 
        rowField: currentRows.filter(f => f !== fieldToRemove) 
    });
  };

  const setPrimaryRow = (field: string) => {
      onChange({ ...config, rowField: [field] });
  }

  // Get headers that are not yet selected in rowField
  const availableForRows = headers.filter(h => !config.rowField.includes(h));
  
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 shadow-sm overflow-y-auto w-full">
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-slate-800">Data Controls</h2>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Quick Views - Highlighted Section */}
        {headers.length > 0 && (
            <div className="space-y-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                 <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                    <LayoutTemplate className="w-4 h-4" /> Quick Group By
                </label>
                <div className="flex flex-wrap gap-2">
                    {headers.map(h => (
                        <button
                            key={h}
                            onClick={() => setPrimaryRow(h)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all shadow-sm ${
                                config.rowField.length === 1 && config.rowField[0] === h
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold ring-2 ring-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md'
                            }`}
                        >
                            {h}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <hr className="border-slate-100" />

        {/* Row Grouping Multi-Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rows (Group Hierarchy)
          </label>
          
          {/* List Selected Rows */}
          <div className="flex flex-col gap-2 mb-2">
            {config.rowField.map((field, index) => (
                <div key={field} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-md text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold opacity-50">{index + 1}.</span>
                        <span>{field}</span>
                    </div>
                    <button 
                        onClick={() => removeRowField(field)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
            {config.rowField.length === 0 && (
                <div className="text-sm text-slate-400 italic py-2">No row groups selected.</div>
            )}
          </div>

          {/* Add Row Dropdown */}
          <div className="relative">
             <select 
                value=""
                onChange={(e) => addRowField(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-300 cursor-pointer appearance-none"
             >
                <option value="" disabled>+ Add Row Group...</option>
                {availableForRows.map(h => (
                    <option key={`opt-${h}`} value={h}>{h}</option>
                ))}
             </select>
             <Plus className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Column Pivot */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Columns (Pivot By)
          </label>
          <select 
            value={config.colField || "NONE"}
            onChange={(e) => handleSingleChange('colField', e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="NONE">None (Simple Table)</option>
            {headers.map(h => (
              <option key={`col-${h}`} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Values */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Values (Metric)
          </label>
          <select 
            value={config.valueField}
            onChange={(e) => handleSingleChange('valueField', e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            {headers.map(h => (
              <option key={`val-${h}`} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Aggregator */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-3 h-3" /> Aggregation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AggregatorType).map(agg => (
              <button
                key={agg}
                onClick={() => handleSingleChange('aggregator', agg)}
                className={`text-xs py-2 px-3 rounded-md border transition-colors font-medium
                  ${config.aggregator === agg 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {agg}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Pro Tip: Use the AI Assistant to auto-configure these fields.
        </p>
      </div>
    </div>
  );
};

export default PivotControls;