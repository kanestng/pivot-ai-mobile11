import React, { useState } from 'react';
import { parseCSV } from './services/dataService';
import { DataRow } from './types';
import { Loader2, AlertCircle, RefreshCw, FileText, ChartPie, Database, ArrowRight, UploadCloud, X } from 'lucide-react';
import PivotView from './components/PivotView';
import DataLog from './components/DataLog';
import FileUpload from './components/FileUpload';

// Sample Google Sheet for Demo purposes
const DEMO_SHEET_ID = '10gGU4ZZH_qUKwYklfIK0sQFNCUCfUc36C3SpkfUoQlA';
const DEMO_CSV_URL = `https://docs.google.com/spreadsheets/d/${DEMO_SHEET_ID}/export?format=csv`;

type ViewMode = 'upload' | 'hub' | 'log' | 'pivot';

const App: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  
  const [view, setView] = useState<ViewMode>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to process raw CSV text
  const processCSV = (text: string, name: string) => {
    try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) throw new Error('File is empty or invalid CSV');
        
        setData(parsedData);
        setHeaders(Object.keys(parsedData[0]));
        setFileName(name);
        setView('hub'); // Go to Hub after successful load
        setError(null);
    } catch (e) {
        console.error(e);
        setError("Failed to parse CSV file. Please ensure it is a valid format.");
    }
  };

  const handleFileUpload = (content: string, name: string) => {
      processCSV(content, name);
  };

  const handleLoadDemo = async () => {
      setIsLoading(true);
      setError(null);
      try {
          const res = await fetch(DEMO_CSV_URL);
          if (!res.ok) throw new Error('Failed to connect to Google Sheets');
          const text = await res.text();
          processCSV(text, "Demo Sales Data");
      } catch (e) {
          console.error(e);
          setError("Could not load demo data. Check your internet connection.");
      } finally {
          setIsLoading(false);
      }
  };

  const resetApp = () => {
      setData([]);
      setHeaders([]);
      setFileName("");
      setView('upload');
      setError(null);
  };

  // 1. Loading Screen
  if (isLoading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="text-slate-500 font-medium animate-pulse">Loading Dataset...</div>
          </div>
      );
  }

  // 2. Upload / Start Screen
  if (view === 'upload') {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
             <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2">
                         <div className="bg-blue-600 p-2 rounded-lg">
                            <Database className="w-6 h-6 text-white" />
                         </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PivotAI Explorer</h1>
                    <p className="text-slate-500">Import your data to begin analysis</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100">
                    <FileUpload onUpload={handleFileUpload} />
                    
                    <div className="p-4">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-semibold uppercase">Or</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>
                        <button 
                            onClick={handleLoadDemo}
                            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <UploadCloud className="w-4 h-4" /> Load Demo Dataset
                        </button>
                    </div>
                </div>
             </div>
          </div>
      );
  }

  // 3. Routing for App Views
  if (view === 'log') {
      return <DataLog data={data} headers={headers} onBack={() => setView('hub')} />;
  }

  if (view === 'pivot') {
      return <PivotView data={data} headers={headers} fileName={fileName} onRefresh={() => {}} onBack={() => setView('hub')} />;
  }

  // 4. Hub (Dashboard)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 flex items-center gap-2 justify-center md:justify-start">
                    <span className="font-semibold text-blue-600">{fileName}</span>
                    <span className="text-slate-300">•</span>
                    <span>{data.length} records</span>
                </p>
            </div>
            <button 
                onClick={resetApp}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-sm font-medium flex items-center gap-2"
            >
                <X className="w-4 h-4" /> Close File
            </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pivot Button */}
            <button 
                onClick={() => setView('pivot')}
                className="group relative flex flex-col items-start p-8 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="bg-white/20 p-3 rounded-xl mb-6 backdrop-blur-sm">
                    <ChartPie className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pivot AI Analysis</h3>
                <p className="text-blue-100 mb-8 max-w-xs">
                    Interactive pivot tables, charts, and AI-powered insights.
                </p>
                <div className="mt-auto flex items-center font-bold text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    Open Analyzer <ArrowRight className="w-4 h-4 ml-2" />
                </div>
            </button>

            {/* Log Button */}
            <button 
                onClick={() => setView('log')}
                className="group relative flex flex-col items-start p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left"
            >
                <div className="bg-emerald-100 p-3 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Raw Data Log</h3>
                <p className="text-slate-500 mb-8 max-w-xs">
                    Inspect the raw dataset in a clean tabular view.
                </p>
                <div className="mt-auto flex items-center font-bold text-emerald-600">
                    View Table <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        </div>

      </div>
    </div>
  );
};

export default App;