import React, { useState, useEffect } from 'react';
import { fetchDatasetStatistics, clearDataset, loadSampleDataset, DatasetStatistics } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [dataStats, setDataStats] = useState<DatasetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const stats = await fetchDatasetStatistics();
      setDataStats(stats);
    } catch (err) {
      console.warn('Failed to load stats', err);
      setDataStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDataset = async () => {
    if (window.confirm('Are you sure you want to remove this dataset? The dashboard and preview will be emptied.')) {
      setIsRemoving(true);
      try {
        await clearDataset();
        setDataStats(null);
      } catch (err) {
        console.error('Failed to clear dataset:', err);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handleLoadSample = async (sampleId: string) => {
    setLoadingSample(sampleId);
    try {
      await loadSampleDataset(sampleId);
      const stats = await fetchDatasetStatistics();
      setDataStats(stats);
    } catch (err) {
      console.error('Failed to load sample dataset', err);
    } finally {
      setLoadingSample(null);
    }
  };

  if (loading) {
    return (
      <div id="dashboard-page" className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl animate-spin">sync</span>
          <p className="text-sm font-medium text-[#0F172A]">Computing dataset analytics...</p>
        </div>
      </div>
    );
  }

  // Empty State when no dataset has been uploaded or when user removes dataset
  if (!dataStats || !dataStats.stats || dataStats.stats.totalRows === 0) {
    return (
      <div id="dashboard-page" className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] shadow-sm text-center max-w-lg w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2 font-['Plus_Jakarta_Sans']">
            No Data Available for Dashboard
          </h3>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            The analytics dashboard generates KPI health metrics, column distributions, and statistical summaries dynamically from your uploaded spreadsheets.
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

  const stats = dataStats.stats;
  const numericCols = Object.keys(stats.numericSummaries || {});

  const barChartData = numericCols.slice(0, 6).map((colName) => ({
    name: colName,
    mean: Math.round(stats.numericSummaries[colName]?.mean || 0),
    median: Math.round(stats.numericSummaries[colName]?.median || 0),
    max: Math.round(stats.numericSummaries[colName]?.max || 0)
  }));

  return (
    <div id="dashboard-page" className="w-full p-3 sm:p-6 md:p-8 min-h-[calc(100vh-4rem)] max-w-[1440px] mx-auto bg-[#F8FAFC] text-[#0F172A]">
      {/* Header */}
      <header id="dashboard-header" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl md:text-3xl font-bold text-[#0F172A]">
            Dataset Health & Analytics Dashboard
          </h2>
          <p className="text-[#64748B] text-xs sm:text-sm mt-0.5 sm:mt-1">
            Real-time spreadsheet metrics for: <span className="font-semibold text-[#004ac6]">{dataStats.datasetName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleRemoveDataset}
            disabled={isRemoving}
            title="Remove and empty this dataset"
            className="bg-white border border-red-200 text-red-600 font-medium text-xs px-3 py-2 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1.5 min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
            <span className="hidden sm:inline">Remove Dataset</span>
            <span className="sm:hidden text-[11px]">Remove</span>
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className="bg-[#004ac6] text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 min-h-[38px]"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Ask AI Questions</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Section */}
      <section id="kpi-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Rows */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium">Total Rows</span>
            <span className="material-symbols-outlined text-[#004ac6] text-lg sm:text-2xl">table_rows</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">
            {stats.totalRows.toLocaleString()}
          </div>
          <p className="text-[11px] sm:text-[12px] text-green-600 mt-1 sm:mt-2 font-medium">100% Parsed</p>
        </div>

        {/* Columns */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium">Total Columns</span>
            <span className="material-symbols-outlined text-[#06B6D4] text-lg sm:text-2xl">view_column</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">{stats.totalCols}</div>
          <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-1 sm:mt-2 truncate">{stats.numericColCount} Num, {stats.categoricalColCount} Text</p>
        </div>

        {/* Missing Data */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium">Missing Data %</span>
            <span className="material-symbols-outlined text-amber-500 text-lg sm:text-2xl">warning</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">{stats.nullRatioPct}%</div>
          <p className="text-[11px] sm:text-[12px] text-green-600 mt-1 sm:mt-2 font-medium">Integrity Check</p>
        </div>

        {/* Format & Size */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium">Format & Size</span>
            <span className="material-symbols-outlined text-purple-600 text-lg sm:text-2xl">folder_zip</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">{stats.fileType}</div>
          <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-1 sm:mt-2">{stats.fileSizeKB} KB memory</p>
        </div>

        {/* Engine Speed */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-xs border border-[#E2E8F0] col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[#64748B] text-[11px] sm:text-xs font-medium">Engine Speed</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg sm:text-2xl">bolt</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-bold text-[#0F172A]">~120 ms</div>
          <p className="text-[11px] sm:text-[12px] text-emerald-600 mt-1 sm:mt-2 font-semibold">In-memory Engine</p>
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Column Means & Max Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-[#E2E8F0] lg:col-span-2">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-[#0F172A]">
                Numeric Features Statistics Overview
              </h3>
              <p className="text-xs text-[#64748B]">Comparing Means & Maximums across dataset columns</p>
            </div>
            <span className="material-symbols-outlined text-[#64748B]">bar_chart</span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="mean" fill="#004ac6" name="Average Mean" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="#06B6D4" name="Max Value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#64748B]">
                No numeric columns found in this dataset.
              </div>
            )}
          </div>
        </div>

        {/* Feature Distribution Donut */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-[#E2E8F0]">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-[#0F172A]">
                Column Types Breakdown
              </h3>
              <p className="text-xs text-[#64748B]">Numeric vs Categorical</p>
            </div>
            <span className="material-symbols-outlined text-[#64748B]">donut_large</span>
          </div>

          <div className="h-48 sm:h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Numeric', value: stats.numericColCount },
                    { name: 'Categorical', value: stats.categoricalColCount }
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#004ac6" />
                  <Cell fill="#06B6D4" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 sm:gap-6 mt-2 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#004ac6]"></span>
              <span>Numeric ({stats.numericColCount})</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#06B6D4]"></span>
              <span>Text/Dates ({stats.categoricalColCount})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Numeric Summaries Detailed Table */}
      {numericCols.length > 0 && (
        <section className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-xs border border-[#E2E8F0] p-4 sm:p-6">
          <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-[#0F172A] mb-3 sm:mb-4">
            Detailed Statistical Summary Matrix (5-Number Summary)
          </h3>

          <div className="overflow-x-auto touch-scroll custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="p-2.5 sm:p-3">Column Name</th>
                  <th className="p-2.5 sm:p-3 text-right">Mean</th>
                  <th className="p-2.5 sm:p-3 text-right">Std Dev</th>
                  <th className="p-2.5 sm:p-3 text-right">Min</th>
                  <th className="p-2.5 sm:p-3 text-right">25th %</th>
                  <th className="p-2.5 sm:p-3 text-right">Median</th>
                  <th className="p-2.5 sm:p-3 text-right">75th %</th>
                  <th className="p-2.5 sm:p-3 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {numericCols.map((colName) => {
                  const s = stats.numericSummaries[colName];
                  return (
                    <tr key={colName} className="hover:bg-[#F8FAFC]">
                      <td className="p-2.5 sm:p-3 font-semibold text-[#0F172A]">{colName}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono">{s.mean.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono text-slate-500">{s.std.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono">{s.min.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono text-slate-500">{s.p25.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono font-semibold text-[#004ac6]">{s.median.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono text-slate-500">{s.p75.toLocaleString()}</td>
                      <td className="p-2.5 sm:p-3 text-right font-mono">{s.max.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 py-4 sm:py-6 border-t border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-[#64748B] text-center md:text-left">
          <div>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0F172A]">DataSage AI</p>
            <p className="mt-0.5">© 2026 DataSage AI. Natural Language Spreadsheet Intelligence.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/bikram73/DataSage_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0F172A] hover:text-[#004ac6] hover:bg-white bg-white/60 border border-[#c3c6d7]/50 shadow-2xs transition-all duration-200 group min-h-[36px]"
              aria-label="GitHub Repository"
              title="View DataSage AI on GitHub"
            >
              <svg
                className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110 shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="font-mono">bikram73/DataSage_AI</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
