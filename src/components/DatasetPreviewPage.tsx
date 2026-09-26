import React, { useState, useEffect } from 'react';
import { fetchDatasetPreview, clearDataset, loadSampleDataset, PreviewData } from '../services/api';
import { resetWorkspaceCache } from './WorkspacePage';

interface DatasetPreviewPageProps {
  onNavigate: (tab: string) => void;
}

export const DatasetPreviewPage: React.FC<DatasetPreviewPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDatasetPreview();
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset preview');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDataset = async () => {
    if (window.confirm('Are you sure you want to remove this dataset? All preview tables and dashboard metrics will be emptied.')) {
      setIsRemoving(true);
      try {
        await clearDataset();
        resetWorkspaceCache();
        setPreviewData(null);
        setSelectedRows([]);
        setSearchTerm('');
      } catch (err: any) {
        console.error('Failed to clear dataset:', err);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handleLoadSample = async (sampleId: string) => {
    setLoadingSample(sampleId);
    try {
      const ds = await loadSampleDataset(sampleId);
      const preview = await fetchDatasetPreview();
      setPreviewData(preview || { ...ds, sampleRows: [] });
    } catch (err: any) {
      setError('Failed to load sample dataset');
    } finally {
      setLoadingSample(null);
    }
  };

  if (loading) {
    return (
      <div id="dataset-preview-page" className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl animate-spin">sync</span>
          <p className="text-sm font-medium text-[#0F172A]">Loading dataset preview...</p>
        </div>
      </div>
    );
  }

  // Empty State when no dataset is uploaded or when user removes dataset
  if (error || !previewData) {
    return (
      <div id="dataset-preview-page" className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] shadow-sm text-center max-w-lg w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">table_chart_view</span>
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2 font-['Plus_Jakarta_Sans']">
            No Dataset Uploaded
          </h3>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            There is currently no active dataset. Import your CSV or Excel spreadsheet to preview records, explore columns, view data types, and run natural language AI analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={() => onNavigate('upload')}
              className="px-6 py-3 bg-[#004ac6] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Import Dataset</span>
            </button>
            <button
              disabled={loadingSample !== null}
              onClick={() => handleLoadSample('sales_data')}
              className="px-5 py-3 bg-white border border-[#CBD5E1] text-[#0F172A] rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#F1F5F9] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                {loadingSample ? 'sync' : 'dataset'}
              </span>
              <span>{loadingSample ? 'Loading...' : 'Try Sample Dataset'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const columns = previewData.columns || [];
  const rows = previewData.sampleRows || [];

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleSelectRow = (idx: number) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((r) => r !== idx) : [...prev, idx]
    );
  };

  const exportCSV = () => {
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k] || ''}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${previewData.name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="dataset-preview-page" className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Sticky Header */}
      <header id="preview-header" className="bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-3 sm:px-6 md:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <nav className="flex items-center text-[#64748B] text-xs font-medium min-w-0">
            <span className="cursor-pointer hover:text-[#004ac6] shrink-0" onClick={() => onNavigate('upload')}>Datasets</span>
            <span className="material-symbols-outlined text-[16px] mx-1 shrink-0">chevron_right</span>
            <span className="text-[#0F172A] font-semibold truncate max-w-[110px] sm:max-w-xs">{previewData.name}</span>
          </nav>
          <span className="text-xs bg-blue-50 text-[#004ac6] font-semibold px-2 py-0.5 rounded-full border border-blue-100 hidden sm:inline shrink-0">
            {previewData.rowCount.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Remove / Clear Dataset button */}
          <button
            onClick={handleRemoveDataset}
            disabled={isRemoving}
            title="Remove and empty this dataset"
            className="bg-white border border-red-200 text-red-600 font-medium text-xs px-2.5 sm:px-3.5 py-2 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
            <span className="hidden sm:inline">Remove Dataset</span>
            <span className="sm:hidden text-[11px]">Remove</span>
          </button>

          <button 
            id="preview-export-btn"
            onClick={exportCSV}
            className="bg-white border border-[#CBD5E1] text-[#0F172A] font-medium text-xs px-2.5 sm:px-3.5 py-2 rounded-xl hover:bg-[#F1F5F9] transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden text-[11px]">CSV</span>
          </button>

          <button 
            id="preview-run-analysis-btn"
            onClick={() => onNavigate('workspace')}
            className="bg-[#004ac6] text-white font-semibold text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 sm:gap-1.5 min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Ask AI</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-3 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 max-w-[1440px] mx-auto w-full">
        {/* Statistics Bento Grid */}
        <section id="preview-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Rows */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
              <span className="p-1.5 sm:p-2 bg-[#004ac6]/10 rounded-lg text-[#004ac6] material-symbols-outlined text-lg sm:text-2xl">reorder</span>
              <span className="text-green-600 bg-green-50 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">{previewData.fileType}</span>
            </div>
            <p className="text-[#64748B] text-[11px] sm:text-xs font-medium">Total Records</p>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">{previewData.rowCount.toLocaleString()}</h3>
          </div>

          {/* Columns */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
              <span className="p-1.5 sm:p-2 bg-cyan-100 rounded-lg text-[#06B6D4] material-symbols-outlined text-lg sm:text-2xl">view_column</span>
            </div>
            <p className="text-[#64748B] text-[11px] sm:text-xs font-medium">Total Columns</p>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">{previewData.columnCount}</h3>
          </div>

          {/* Numeric Columns */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
              <span className="p-1.5 sm:p-2 bg-purple-100 rounded-lg text-purple-700 material-symbols-outlined text-lg sm:text-2xl">numbers</span>
            </div>
            <p className="text-[#64748B] text-[11px] sm:text-xs font-medium">Numeric Columns</p>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">
              {columns.filter((c) => c.type === 'Float' || c.type === 'Integer').length}
            </h3>
          </div>

          {/* Categorical Columns */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-1.5 sm:mb-2">
              <span className="p-1.5 sm:p-2 bg-amber-100 rounded-lg text-amber-700 material-symbols-outlined text-lg sm:text-2xl">category</span>
            </div>
            <p className="text-[#64748B] text-[11px] sm:text-xs font-medium">Categorical Columns</p>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">
              {columns.filter((c) => c.type === 'String' || c.type === 'Date').length}
            </h3>
          </div>
        </section>

        {/* Table Controls */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none text-lg">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dataset cells..."
              className="w-full bg-white border border-[#CBD5E1] rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium whitespace-nowrap">
              Showing preview of {filteredRows.length} / {previewData.rowCount.toLocaleString()} rows
            </span>
          </div>
        </section>

        {/* Main Data Table */}
        <section className="bg-white rounded-2xl sm:rounded-[18px] shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="overflow-x-auto touch-scroll custom-scrollbar max-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                  <th className="p-3 sm:p-4 w-12 sticky left-0 bg-[#F8FAFC] z-10">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRows(rows.map((_, i) => i));
                        else setSelectedRows([]);
                      }}
                      className="rounded border-[#CBD5E1] text-[#004ac6] w-4 h-4"
                    />
                  </th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="p-3 sm:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          col.type === 'Float' || col.type === 'Integer' ? 'bg-blue-100 text-blue-700' :
                          col.type === 'Date' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {col.type}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0] text-xs sm:text-sm">
                {filteredRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    onClick={() => toggleSelectRow(rIdx)}
                    className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      selectedRows.includes(rIdx) ? 'bg-[#004ac6]/5' : ''
                    }`}
                  >
                    <td className="p-3 sm:p-4 sticky left-0 bg-white z-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(rIdx)}
                        onChange={() => toggleSelectRow(rIdx)}
                        className="rounded border-[#CBD5E1] text-[#004ac6] w-4 h-4"
                      />
                    </td>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-3 sm:p-4 text-[#0F172A] whitespace-nowrap">
                        {row[col.name] !== undefined && row[col.name] !== null
                          ? typeof row[col.name] === 'number'
                            ? row[col.name].toLocaleString()
                            : String(row[col.name])
                          : <span className="text-slate-400 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Schema & Column Breakdown Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#E2E8F0]">
            <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A] mb-3">
              Column Data Types & Quality
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {columns.map((col, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F172A]">{col.name}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{col.type}</span>
                  </div>
                  <span className="text-xs text-[#64748B]">
                    {col.nullCount === 0 ? '100% Valid' : `${col.nullCount} missing`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#E2E8F0] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A]">
                  AI Natural Language Ready
                </h4>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                DataSage AI is synced with this spreadsheet dataset. Ask natural language questions like:
              </p>
              <ul className="text-xs text-[#004ac6] space-y-1.5 list-disc list-inside">
                <li>Which region or category had the highest growth?</li>
                <li>What is the average and median metric value?</li>
                <li>Show top 10 items ranked by performance</li>
                <li>Plot trend and distribution charts</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('workspace')}
              className="mt-4 w-full py-2.5 bg-[#004ac6] text-white rounded-xl font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Start Q&A Workspace</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
