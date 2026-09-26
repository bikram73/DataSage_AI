import React, { useState, useEffect, useRef } from 'react';
import { queryDataset, fetchDatasetPreview, loadSampleDataset, QueryResult, PreviewData } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface WorkspacePageProps {
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  result?: QueryResult;
  loading?: boolean;
}

const CHART_COLORS = ['#004ac6', '#06B6D4', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

// In-memory workspace session cache (survives tab switching, cleared on page refresh or dataset removal)
let cachedDatasetId: string | null = null;
let cachedMessages: ChatMessage[] = [];
let cachedActiveResult: QueryResult | null = null;

export function resetWorkspaceCache() {
  cachedDatasetId = null;
  cachedMessages = [];
  cachedActiveResult = null;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [activeDataset, setActiveDataset] = useState<PreviewData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => cachedMessages);
  const [activeResult, setActiveResult] = useState<QueryResult | null>(() => cachedActiveResult);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleDownloadCSV = (tableData: Record<string, any>[], filename?: string) => {
    if (!tableData || tableData.length === 0) return;
    const cleanFilename = filename || `DataSage_Analysis_${new Date().toISOString().replace(/[:.]/g, '_')}.csv`;
    const headers = Object.keys(tableData[0]);
    const csvRows = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...tableData.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', cleanFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = (result: QueryResult, filename?: string) => {
    const cleanFilename = filename || `DataSage_Analysis_${new Date().toISOString().replace(/[:.]/g, '_')}.json`;
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', cleanFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (msg: ChatMessage, filename?: string) => {
    if (!msg.result) return;
    const cleanFilename = filename || `DataSage_Report_${new Date().toISOString().replace(/[:.]/g, '_')}.md`;
    const headers = msg.result.table && msg.result.table.length > 0 ? Object.keys(msg.result.table[0]) : [];
    const tableMd = msg.result.table && msg.result.table.length > 0
      ? [
          `| ${headers.join(' | ')} |`,
          `| ${headers.map(() => '---').join(' | ')} |`,
          ...msg.result.table.map((row) => `| ${headers.map((h) => row[h] ?? '').join(' | ')} |`)
        ].join('\n')
      : 'No tabular records.';

    const mdContent = `# 📊 DataSage AI Analysis Report
**Generated:** ${new Date().toLocaleString()}  
**Dataset:** ${activeDataset?.name || 'Active Dataset'} (${activeDataset?.rowCount.toLocaleString() || 0} rows)

---

## 💬 Insight Summary
${msg.text}

---

## 📋 Computed Result Table
${tableMd}

---

## ⚙️ Computation Details
- **Methodology:** ${msg.result.calculation}
- **Records Processed:** ${msg.result.rowsUsed.toLocaleString()} rows
- **Execution Latency:** ${msg.result.executionTimeMs} ms

---

## 🐍 Python Pandas Query
\`\`\`python
${msg.result.pythonCode}
\`\`\`
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', cleanFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyTable = (tableData: Record<string, any>[], msgId: string) => {
    if (!tableData || tableData.length === 0) return;
    const headers = Object.keys(tableData[0]);
    const tsv = [
      headers.join('\t'),
      ...tableData.map((row) => headers.map((h) => row[h] ?? '').join('\t'))
    ].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadScript = (code: string, filename?: string) => {
    if (!code) return;
    const cleanFilename = filename || `DataSage_Query_${Date.now()}.py`;
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', cleanFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDatasetPreview()
      .then((ds) => {
        if (ds && ds.name) {
          setActiveDataset(ds);
          if (cachedDatasetId !== ds.id) {
            // New or newly loaded dataset
            cachedDatasetId = ds.id;
            const initialMsg: ChatMessage = {
              id: '1',
              sender: 'ai',
              text: `Hello! I'm DataSage AI. I've loaded your spreadsheet **"${ds.name}"** containing **${ds.rowCount.toLocaleString()}** rows and **${ds.columnCount}** columns. Ask me anything in plain English!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            cachedMessages = [initialMsg];
            cachedActiveResult = null;
            setMessages([initialMsg]);
            setActiveResult(null);
          } else {
            // Same dataset upon tab return: restore existing messages and results
            if (cachedMessages.length > 0) {
              setMessages(cachedMessages);
            }
            if (cachedActiveResult) {
              setActiveResult(cachedActiveResult);
            }
          }
        } else {
          setActiveDataset(null);
          resetWorkspaceCache();
        }
      })
      .catch(() => {
        setActiveDataset(null);
      })
      .finally(() => setLoadingInitial(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isGenerating) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      cachedMessages = updated;
      return updated;
    });
    setInputQuery('');
    setIsGenerating(true);

    try {
      const res = await queryDataset(query);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: res
      };

      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        cachedMessages = updated;
        return updated;
      });
      cachedActiveResult = res;
      setActiveResult(res);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Sorry, I encountered an issue analyzing the dataset: ${err.message || 'Error executing query'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        cachedMessages = updated;
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      const ds = await loadSampleDataset('sales_data');
      const preview = await fetchDatasetPreview();
      setActiveDataset(preview || { ...ds, sampleRows: [] });
      cachedDatasetId = ds.id;
      const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `Loaded **"${ds.name}"** (${ds.rowCount.toLocaleString()} rows, ${ds.columnCount} cols). What would you like to calculate or explore?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      cachedMessages = [initialMsg];
      cachedActiveResult = null;
      setMessages([initialMsg]);
      setActiveResult(null);
    } catch (err) {
      console.error('Failed to load sample dataset', err);
    } finally {
      setLoadingSample(false);
    }
  };

  const samplePrompts = [
    'Which region had the highest growth?',
    'What is the average profit and median revenue?',
    'Show top 10 items ranked by revenue',
    'Plot monthly sales distribution',
    'Which categories underperformed target?'
  ];

  if (loadingInitial) {
    return (
      <div id="workspace-page" className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl animate-spin">sync</span>
          <p className="text-sm font-medium text-[#0F172A]">Initializing AI Workspace...</p>
        </div>
      </div>
    );
  }

  // If no dataset is active
  if (!activeDataset) {
    return (
      <div id="workspace-page" className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-8 flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] shadow-sm text-center max-w-lg w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#004ac6] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-2 font-['Plus_Jakarta_Sans']">
            No Dataset Loaded for Workspace
          </h3>
          <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
            Import a spreadsheet dataset (CSV, XLSX, XLS) to begin asking natural language questions, generating charts, and executing Python Pandas computations.
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
              disabled={loadingSample}
              onClick={handleLoadSample}
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

  return (
    <div id="workspace-page" className="w-full flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Central Chat Interface */}
      <section className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Chat Header */}
        <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#004ac6]">auto_awesome</span>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-[#0F172A]">
                Dataset Q&A Chat Workspace
              </h2>
              <p className="text-xs text-[#64748B]">
                Active: <span className="font-medium text-[#004ac6]">{activeDataset.name}</span> ({activeDataset.rowCount.toLocaleString()} rows)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('preview')}
              className="px-3 py-1.5 bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
              <span className="hidden sm:inline">Dataset</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3 py-1.5 bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">insights</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              <span className="hidden sm:inline">Change File</span>
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 custom-scrollbar space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 sm:gap-4 max-w-3xl mx-auto w-full">
              {msg.sender === 'user' ? (
                <>
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#E2E8F0] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#64748B] text-[20px]">person</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#004ac6] text-white p-3.5 sm:p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-xs font-medium">
                      {msg.text}
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block ml-1">{msg.time}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#004ac6] flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 sm:p-4 rounded-2xl rounded-tl-none text-[#0F172A] text-sm leading-relaxed">
                      <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {msg.result && (
                      <div className="space-y-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
                        {/* Analysis Header & Download Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-[#0F172A] tracking-tight uppercase">Analysis Complete</span>
                          </div>
                          
                          {/* Download & Export Options */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.result.table && msg.result.table.length > 0 && (
                              <>
                                <button
                                  onClick={() => handleDownloadCSV(msg.result!.table, `DataSage_${activeDataset?.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.csv`)}
                                  title="Download structured result table as CSV"
                                  className="px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dbeafe] text-[#004ac6] rounded-lg text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 border border-[#bfdbfe]"
                                >
                                  <span className="material-symbols-outlined text-[16px]">download</span>
                                  <span>Download CSV</span>
                                </button>
                                <button
                                  onClick={() => handleDownloadJSON(msg.result!, `DataSage_${activeDataset?.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.json`)}
                                  title="Download full analysis payload as JSON"
                                  className="px-2.5 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] rounded-lg text-xs font-medium transition-all flex items-center gap-1 active:scale-95 border border-[#E2E8F0]"
                                >
                                  <span className="material-symbols-outlined text-[16px] text-[#0891B2]">data_object</span>
                                  <span>JSON</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDownloadReport(msg, `DataSage_Report_${activeDataset?.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.md`)}
                              title="Download complete formatted Markdown report"
                              className="px-2.5 py-1.5 bg-[#004ac6] hover:brightness-110 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">description</span>
                              <span>Export Report</span>
                            </button>
                          </div>
                        </div>

                        {/* Result Table */}
                        {msg.result.table && msg.result.table.length > 0 && (
                          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#64748B]">
                              <div className="flex items-center gap-2">
                                <span className="text-[#0F172A]">Computed Result Data</span>
                                <span className="px-1.5 py-0.5 bg-[#E2E8F0] text-[#475569] rounded-md text-[10px] font-semibold">
                                  {msg.result.table.length} Rows
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadCSV(msg.result!.table, `DataSage_Table_${Date.now()}.csv`)}
                                  className="text-[11px] text-[#004ac6] hover:underline flex items-center gap-1 font-medium"
                                  title="Download Table CSV"
                                >
                                  <span className="material-symbols-outlined text-[14px]">download</span>
                                  <span>CSV</span>
                                </button>
                                <span className="text-[#CBD5E1]">|</span>
                                <button
                                  onClick={() => handleCopyTable(msg.result!.table, msg.id)}
                                  className="text-[11px] text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 font-medium"
                                  title="Copy tabular data to clipboard"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {copiedId === msg.id ? 'check' : 'content_copy'}
                                  </span>
                                  <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="overflow-x-auto max-h-60 custom-scrollbar">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                                    {Object.keys(msg.result.table[0]).map((k, i) => (
                                      <th key={i} className="p-2.5">{k}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                  {msg.result.table.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-[#F8FAFC]">
                                      {Object.values(row).map((val, cIdx) => (
                                        <td key={cIdx} className="p-2.5 font-medium text-[#0F172A]">
                                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Result Chart */}
                        {msg.result.chart && msg.result.chart.type !== 'none' && msg.result.chart.data?.length > 0 && (
                          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                            <h4 className="text-xs font-semibold text-[#0F172A] mb-3">{msg.result.chart.title}</h4>
                            <div className="h-56 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                {msg.result.chart.type === 'line' ? (
                                  <LineChart data={msg.result.chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                    <YAxis stroke="#64748B" fontSize={11} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#004ac6" strokeWidth={3} />
                                  </LineChart>
                                ) : (
                                  <BarChart data={msg.result.chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                    <YAxis stroke="#64748B" fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#004ac6" radius={[4, 4, 0, 0]}>
                                      {msg.result.chart.data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                )}
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Calculation Explanation */}
                        <div className="p-3 bg-[#F1F5F9] rounded-xl border border-[#CBD5E1]/50 text-xs text-[#0F172A] space-y-1">
                          <span className="font-semibold text-[#004ac6] block">Computation Explanation:</span>
                          <p>{msg.result.calculation}</p>
                          <p className="text-[10px] text-[#64748B]">Processed {msg.result.rowsUsed.toLocaleString()} rows in {msg.result.executionTimeMs} ms</p>
                        </div>

                        {/* Python Code Snippet */}
                        <div className="bg-[#0F172A] rounded-xl p-3 text-white text-xs font-['JetBrains_Mono'] relative group">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 border-b border-slate-700 pb-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                              <span className="material-symbols-outlined text-[12px] text-emerald-400">code</span>
                              <span>Pandas Execution Blueprint</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadScript(msg.result?.pythonCode || '')}
                                className="hover:text-emerald-400 text-slate-400 flex items-center gap-0.5 transition-colors"
                                title="Download .py script"
                              >
                                <span className="material-symbols-outlined text-[12px]">download</span>
                                <span>.py</span>
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.result?.pythonCode || '');
                                  setCopiedId(`py-${msg.id}`);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="hover:text-white text-slate-400 flex items-center gap-0.5 transition-colors"
                                title="Copy code"
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {copiedId === `py-${msg.id}` ? 'check' : 'content_copy'}
                                </span>
                                <span>{copiedId === `py-${msg.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                          <pre className="overflow-x-auto text-emerald-400 pt-1 text-[11px] leading-relaxed">{msg.result.pythonCode}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-4 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl rounded-tl-none text-xs text-[#64748B] flex items-center gap-2">
                <span>Executing Pandas analytics engine on dataset...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Suggestions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[#64748B] whitespace-nowrap text-[11px] font-medium">Suggestions:</span>
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] transition-colors font-medium shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask any question about this dataset (e.g. 'What is the total sales by region?')..."
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all text-[#0F172A]"
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isGenerating}
                className="bg-[#004ac6] text-white p-3 rounded-xl shadow-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>

            <p className="text-[11px] text-[#64748B] text-center">
              DataSage AI computes real Pandas statistics directly on in-memory dataset records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
