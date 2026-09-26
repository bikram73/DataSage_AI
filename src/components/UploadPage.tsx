import React, { useState, useRef, useEffect } from 'react';
import { parseSpreadsheetFile } from '../utils/fileParser';
import { uploadCustomDataset, loadSampleDataset, fetchSampleDatasets, fetchDatasetPreview, clearDataset, DatasetInfo } from '../services/api';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { resetWorkspaceCache } from './WorkspacePage';

interface UploadPageProps {
  onNavigate: (tab: string) => void;
}

export function downloadSampleCSV(sampleId: string = 'sales_data') {
  const dataset = SAMPLE_DATASETS[sampleId] || SAMPLE_DATASETS.sales_data;
  if (!dataset || !dataset.rows || dataset.rows.length === 0) return;

  const headers = Object.keys(dataset.rows[0]);
  const csvContent = [
    headers.join(','),
    ...dataset.rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          if (val === null || val === undefined) return '';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const downloadName = dataset.name.replace(/\.(xlsx|xls)$/i, '.csv');
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeDatasetInfo, setActiveDatasetInfo] = useState<DatasetInfo | null>(null);
  const [sampleDatasets, setSampleDatasets] = useState<DatasetInfo[]>([]);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSampleDatasets()
      .then(setSampleDatasets)
      .catch((err) => console.warn('Could not fetch sample datasets:', err));

    fetchDatasetPreview()
      .then((ds) => {
        if (ds && ds.name) {
          setActiveDatasetInfo(ds);
          setUploadState('success');
        }
      })
      .catch(() => {});
  }, []);

  const handleProcessFile = async (file: File) => {
    setUploadState('uploading');
    setProgress(20);
    setErrorMessage('');

    try {
      setProgress(40);
      const parsed = await parseSpreadsheetFile(file);
      setProgress(70);

      if (!parsed.rows || parsed.rows.length === 0) {
        throw new Error('The uploaded spreadsheet contains no data rows.');
      }

      const ds = await uploadCustomDataset(parsed.name, parsed.rows, parsed.fileType, parsed.sizeKB);
      setProgress(100);
      setActiveDatasetInfo(ds);
      setUploadState('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload spreadsheet');
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSelectSample = async (sampleId: string) => {
    setLoadingSample(sampleId);
    try {
      const ds = await loadSampleDataset(sampleId);
      setActiveDatasetInfo(ds);
      setUploadState('success');
    } catch (err: any) {
      setErrorMessage('Failed to load sample dataset');
    } finally {
      setLoadingSample(null);
    }
  };

  const handleRemoveActiveDataset = async () => {
    if (window.confirm('Are you sure you want to remove the current active dataset?')) {
      try {
        await clearDataset();
        resetWorkspaceCache();
        setActiveDatasetInfo(null);
        setUploadState('idle');
      } catch (err) {
        console.error('Failed to clear dataset', err);
      }
    }
  };

  return (
    <div id="upload-page" className="w-full p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="max-w-3xl w-full mb-6 text-center">
        <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1">
          Import Spreadsheet Dataset
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Upload your CSV, XLSX, or XLS files, or pick a sample dataset to ask natural language Q&A questions.
        </p>
      </div>

      {/* Centered Upload Container */}
      <div className="max-w-3xl w-full bg-white shadow-xs rounded-[18px] p-6 sm:p-8 border border-[#E2E8F0] flex flex-col gap-6">
        
        {/* Error Banner */}
        {uploadState === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setUploadState('idle')}
              className="text-xs underline font-semibold text-red-800 hover:text-red-900"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Idle Drag & Drop Zone */}
        {uploadState === 'idle' && (
          <div className="flex flex-col gap-3">
            <div
              id="drop-zone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative cursor-pointer group border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAFC] hover:border-[#004ac6] hover:bg-[#004ac6]/5 transition-all duration-300 p-8 sm:p-10 flex flex-col items-center justify-center text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xls, .xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-2xl bg-[#004ac6]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#004ac6] text-4xl">upload_file</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg text-[#0F172A] mb-1">
                Click to upload or drag and drop spreadsheet
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Supported formats: CSV, XLS, XLSX (Max 100MB)
              </p>
            </div>

            {/* Quick Sample File Download Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-[#0F172A] font-medium">
                <span className="material-symbols-outlined text-[#004ac6] text-base">download_for_offline</span>
                <span>Download sample spreadsheets to your computer:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleCSV('sales_data')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#004ac6] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  title="Download Sales_Report.csv (1,000 rows)"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>Sales_Report.csv</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleCSV('hr_analytics')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#004ac6] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  title="Download HR_Employee_Analytics.csv (500 rows)"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>HR_Analytics.csv</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleCSV('marketing_campaigns')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-[#004ac6] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  title="Download Marketing_Campaign_ROI.csv (350 rows)"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>Marketing_ROI.csv</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploading Progress State */}
        {uploadState === 'uploading' && (
          <div id="uploading-state" className="flex flex-col gap-4 p-6 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] animate-spin">sync</span>
                <span className="text-sm font-medium text-[#0F172A]">Parsing and analyzing spreadsheet columns...</span>
              </div>
              <span className="text-xs font-semibold text-[#004ac6]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#004ac6] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#64748B] text-center">Detecting data types, missing values, and structure...</p>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && activeDatasetInfo && (
          <div className="flex flex-col gap-4">
            {/* Validation Banner */}
            <div id="validation-success" className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="text-sm font-medium">Dataset active and ready for analysis!</span>
            </div>

            {/* File Info Card */}
            <div id="file-info-card" className="flex flex-col gap-4 p-4 sm:p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Dataset Info</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleRemoveActiveDataset}
                    className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">delete_outline</span> Remove
                  </button>
                  <button 
                    onClick={() => setUploadState('idle')}
                    className="text-[#004ac6] hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span> Upload New
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B]">Dataset Name</span>
                  <span className="text-sm font-semibold text-[#0F172A] truncate">{activeDatasetInfo.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B]">Rows</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{activeDatasetInfo.rowCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B]">Columns</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{activeDatasetInfo.columnCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#64748B]">Format & Size</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{activeDatasetInfo.fileType} ({activeDatasetInfo.fileSizeKB} KB)</span>
                </div>
              </div>

              {activeDatasetInfo.columns && activeDatasetInfo.columns.length > 0 && (
                <div className="border-t border-[#E2E8F0] pt-3">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">Detected Columns:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {activeDatasetInfo.columns.map((col, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-white border border-[#CBD5E1] px-2.5 py-1 rounded-md text-xs font-medium text-[#0F172A]">
                        <span>{col.name}</span>
                        <span className={`text-[10px] px-1 rounded font-bold ${
                          col.type === 'Float' || col.type === 'Integer' ? 'bg-blue-100 text-blue-700' :
                          col.type === 'Date' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {col.type}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-2">
              <button
                onClick={() => onNavigate('preview')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">table_chart</span>
                <span>View Dataset Preview</span>
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">insights</span>
                <span>View Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('workspace')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#004ac6] text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Ask AI Questions</span>
              </button>
            </div>
          </div>
        )}

        {/* Sample Datasets */}
        <div id="recent-datasets" className="border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm text-[#0F172A]">Or Try Ready-To-Use Sample Datasets</h5>
            <span className="text-[#64748B] text-xs">Pre-loaded with 1,000+ records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleDatasets.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className={`p-4 bg-white border border-[#CBD5E1]/70 rounded-2xl flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all cursor-pointer ${
                  loadingSample === sample.id ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#0F172A] truncate">{sample.name}</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#004ac6] px-1.5 py-0.5 rounded">{sample.fileType}</span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3">{sample.description}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] border-t border-slate-100 pt-2 gap-1">
                  <span className="truncate">{sample.rowCount.toLocaleString()} rows • {sample.columnCount} cols</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSampleCSV(sample.id);
                      }}
                      className="text-slate-600 hover:text-[#004ac6] hover:bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium transition-colors"
                      title="Download as CSV file"
                    >
                      <span className="material-symbols-outlined text-[13px]">download</span>
                      <span>CSV</span>
                    </button>
                    <span className="text-[#004ac6] font-semibold flex items-center gap-0.5">
                      Load <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 max-w-3xl w-full flex flex-col md:flex-row justify-between items-center text-[#64748B] text-xs">
        <span>© 2026 DataSage AI. Natural Language Spreadsheet Analytics.</span>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#004ac6] underline transition-colors">Documentation</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#004ac6] underline transition-colors">In-Memory Engine</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#004ac6] underline transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};
