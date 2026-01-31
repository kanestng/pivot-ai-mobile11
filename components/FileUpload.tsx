import React, { ChangeEvent, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (content: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onUpload(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div 
        className={`
            relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
        <div className="mb-4 flex justify-center">
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
            </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload CSV File</h3>
        <p className="text-sm text-slate-400 mb-6">Drag & drop or click to browse</p>

        <label className="inline-flex cursor-pointer">
            <span className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
                Browse Files
            </span>
            <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
            />
        </label>
        
        <div className="mt-6 text-xs text-slate-300 font-medium uppercase tracking-wide">
            Supported Format: .CSV
        </div>
    </div>
  );
};

export default FileUpload;