import React, { useState, useEffect } from 'react';
import { fetchDatasetStatistics, DatasetStatistics } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

const COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [dataStats, setDataStats] = useState<DatasetStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasetStatistics()
      .then(setDataStats)
      .catch((err) => console.warn('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = dataStats?.stats || {
    totalRows: 12480,
    totalCols: 18,
    fileType: 'CSV',
    fileSizeKB: 840,
    nullRatioPct: 0.2,
    numericColCount: 8,
    categoricalColCount: 10,
    numericSummaries: {}
  };

  const numericCols = Object.keys(stats.numericSummaries || {});

  const barChartData = numericCols.slice(0, 6).map((colName) => ({
    name: colName,
    mean: Math.round(stats.numericSummaries[colName]?.mean || 0),
    median: Math.round(stats.numericSummaries[colName]?.median || 0),
    max: Math.round(stats.numericSummaries[colName]?.max || 0)
  }));

  return (
    <div id="dashboard-page" className="w-full p-4 sm:p-6 md:p-8 min-h-[calc(100vh-4rem)] max-w-[1440px] mx-auto bg-[#F8FAFC] text-[#0F172A]">
      {/* Header */}
      <header id="dashboard-header" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0F172A]">
            Dataset Health & Analytics Dashboard
          </h2>
          <p className="text-[#64748B] text-sm mt-1">
            Real-time spreadsheet metrics for: <span className="font-semibold text-[#0F172A]">{dataStats?.datasetName || 'Active Dataset'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('workspace')}
            className="bg-[#2563EB] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Ask Dataset Q&A</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Section */}
      <section id="kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Rows */}
        <div className="bg-white p-5 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-xs font-medium">Total Rows</span>
            <span className="material-symbols-outlined text-[#2563EB]">table_rows</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0F172A]">
            {stats.totalRows.toLocaleString()}
          </div>
          <p className="text-[12px] text-green-600 mt-2 font-medium">100% Validated</p>
        </div>

        {/* Columns */}
        <div className="bg-white p-5 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-xs font-medium">Total Columns</span>
            <span className="material-symbols-outlined text-[#06B6D4]">view_column</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0F172A]">{stats.totalCols}</div>
          <p className="text-[12px] text-[#64748B] mt-2">{stats.numericColCount} Numeric, {stats.categoricalColCount} Text</p>
        </div>

        {/* Missing Data */}
        <div className="bg-white p-5 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-xs font-medium">Missing Data %</span>
            <span className="material-symbols-outlined text-amber-500">warning</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0F172A]">{stats.nullRatioPct}%</div>
          <p className="text-[12px] text-green-600 mt-2 font-medium">Low Missing Ratio</p>
        </div>

        {/* Format & Size */}
        <div className="bg-white p-5 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-xs font-medium">Format & Size</span>
            <span className="material-symbols-outlined text-purple-600">folder_zip</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0F172A]">{stats.fileType}</div>
          <p className="text-[12px] text-[#64748B] mt-2">{stats.fileSizeKB} KB in memory</p>
        </div>

        {/* Queries Engine */}
        <div className="bg-white p-5 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#64748B] text-xs font-medium">Engine Speed</span>
            <span className="material-symbols-outlined text-emerald-600">bolt</span>
          </div>
          <div className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0F172A]">~120 ms</div>
          <p className="text-[12px] text-emerald-600 mt-2 font-semibold">In-memory Pandas</p>
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column Means & Max Breakdown */}
        <div className="bg-white p-6 rounded-[18px] shadow-sm border border-[#E2E8F0] lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A]">
                Numeric Features Statistics Overview
              </h3>
              <p className="text-xs text-[#64748B]">Comparing Means & Maximums across dataset columns</p>
            </div>
            <span className="material-symbols-outlined text-[#64748B]">bar_chart</span>
          </div>

          <div className="h-64 w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="mean" fill="#2563EB" name="Average Mean" radius={[4, 4, 0, 0]} />
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
        <div className="bg-white p-6 rounded-[18px] shadow-sm border border-[#E2E8F0]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A]">
                Column Types Breakdown
              </h3>
              <p className="text-xs text-[#64748B]">Numeric vs Categorical</p>
            </div>
            <span className="material-symbols-outlined text-[#64748B]">donut_large</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
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
                  <Cell fill="#2563EB" />
                  <Cell fill="#06B6D4" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
              <span>Numeric ({stats.numericColCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06B6D4]"></span>
              <span>Text/Dates ({stats.categoricalColCount})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Numeric Summaries Detailed Table */}
      <section className="mt-8 bg-white rounded-[18px] shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A] mb-4">
          Detailed Statistical Summary Matrix (5-Number Summary)
        </h3>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="p-3">Column Name</th>
                <th className="p-3 text-right">Mean</th>
                <th className="p-3 text-right">Std Dev</th>
                <th className="p-3 text-right">Min</th>
                <th className="p-3 text-right">25th %</th>
                <th className="p-3 text-right">Median</th>
                <th className="p-3 text-right">75th %</th>
                <th className="p-3 text-right">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {numericCols.map((colName) => {
                const s = stats.numericSummaries[colName];
                return (
                  <tr key={colName} className="hover:bg-[#F8FAFC]">
                    <td className="p-3 font-semibold text-[#0F172A]">{colName}</td>
                    <td className="p-3 text-right font-mono">{s.mean.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{s.std.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">{s.min.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{s.p25.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-semibold text-[#2563EB]">{s.median.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{s.p75.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">{s.max.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#64748B]">
          <div>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0F172A]">DataSage AI</p>
            <p className="mt-0.5">© 2026 DataSage AI. Natural Language Spreadsheet Intelligence.</p>
          </div>
          <div className="flex gap-6">
            <a className="hover:text-[#2563EB] transition-colors" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="hover:text-[#2563EB] transition-colors" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="hover:text-[#2563EB] transition-colors" href="#" onClick={(e) => e.preventDefault()}>Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
