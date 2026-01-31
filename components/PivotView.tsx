import React, { useState, useEffect } from 'react';
import PivotTable from './PivotTable';
import PivotControls from './PivotControls';
import DataChart from './DataChart';
import AIAnalyst from './AIAnalyst';
import { calculatePivot, pivotResultToCSV } from '../services/dataService';
import { PivotConfig, AggregatorType, DataRow, ChatMessage } from '../types';
import { Table, LayoutDashboard, X, Menu, Share2, RefreshCw, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'pivot_ai_sheet_workspace_v1';

interface PivotViewProps {
  data: DataRow[];
  headers: string[];
  fileName: string;
  onRefresh: () => void;
  onBack: () => void;
}

const PivotView: React.FC<PivotViewProps> = ({ data, headers, fileName, onRefresh, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: "Hi! I'm your AI Analyst. Ask me anything about this dataset!" }
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState<PivotConfig>({
    rowField: [],
    valueField: '',
    aggregator: AggregatorType.SUM
  });

  // Initialize Default Config based on Data
  useEffect(() => {
    // Only set defaults if config is empty
    if (config.rowField.length === 0 && !config.valueField && headers.length > 0) {
         const numericField = headers.find(k => typeof data[0]?.[k] === 'number') || headers[headers.length - 1];
         const categoryField = headers.find(k => typeof data[0]?.[k] === 'string') || headers[0];
         
         if (numericField && categoryField) {
             setConfig({
                rowField: [categoryField],
                valueField: numericField,
                aggregator: AggregatorType.SUM
             });
         }
    }
  }, [headers, data]); 

  const handleExportCSV = () => {
    const result = calculatePivot(data, config);
    const rowLabel = config.rowField.join(' > ') || 'Total';
    const colLabel = config.colField || 'Values';
    const csvContent = pivotResultToCSV(result, rowLabel, colLabel);
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pivot_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'PivotAI Analysis',
                text: `Check out this data analysis.`,
                url: window.location.href
            });
        } catch (e) {
            console.log("Share cancelled/failed", e);
        }
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Top Bar for Mobile */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-blue-600"/> PivotAI
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-slate-500 hover:text-blue-500 p-2">
                <ArrowLeft className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex w-full h-full pt-14 lg:pt-0">
        
        {/* Left Sidebar: Controls */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:shadow-none lg:flex lg:flex-col lg:z-10
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
             <div className="flex items-center gap-2 cursor-pointer group" onClick={onBack}>
                <div className="bg-slate-100 p-1.5 rounded-md group-hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-slate-600"/>
                </div>
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Back to Hub</span>
             </div>
             <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
             <PivotControls 
                headers={headers} 
                numericHeaders={headers.filter(h => typeof data[0]?.[h] === 'number')}
                config={config} 
                onChange={setConfig} 
            />
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[150px] font-medium" title={fileName}>{fileName}</span>
                <span>{data.length} rows</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Table className="w-3.5 h-3.5" /> Export CSV
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                     <button 
                        onClick={handleNativeShare}
                        className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Share App
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* Center: Table & Chart */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
            <div className="h-1/3 border-b border-slate-200 bg-white p-2">
                <DataChart data={data} config={config} />
            </div>
            <div className="h-2/3 relative flex flex-col">
                <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-200 pointer-events-none">
                    Rows: {config.rowField.join(' > ') || 'Total'} &bull; Vals: {config.aggregator}({config.valueField})
                </div>
                <PivotTable data={data} config={config} />
            </div>
        </div>

        {/* Right Sidebar: AI Analyst */}
        <div className="w-96 flex-shrink-0 border-l border-slate-200 bg-white h-full z-10 shadow-xl lg:shadow-none hidden xl:block">
            <AIAnalyst 
                headers={headers} 
                config={config} 
                onConfigChange={setConfig}
                messages={messages}
                setMessages={setMessages} 
            />
        </div>
      </div>
    </div>
  );
};

export default PivotView;