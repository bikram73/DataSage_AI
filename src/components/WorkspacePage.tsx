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

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [activeDataset, setActiveDataset] = useState<PreviewData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDatasetPreview()
      .then((ds) => {
        if (ds && ds.name) {
          setActiveDataset(ds);
          const initialMsg: ChatMessage = {
            id: '1',
            sender: 'ai',
            text: `Hello! I'm DataSage AI. I've loaded your spreadsheet **"${ds.name}"** containing **${ds.rowCount.toLocaleString()}** rows and **${ds.columnCount}** columns. Ask me anything in plain English!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([initialMsg]);
        } else {
          setActiveDataset(null);
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

    setMessages((prev) => [...prev, userMsg]);
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

      setMessages((prev) => [...prev, aiMsg]);
      setActiveResult(res);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Sorry, I encountered an issue analyzing the dataset: ${err.message || 'Error executing query'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
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
      const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: `Loaded **"${ds.name}"** (${ds.rowCount.toLocaleString()} rows, ${ds.columnCount} cols). What would you like to calculate or explore?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMsg]);
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
                        {/* Result Table */}
                        {msg.result.table && msg.result.table.length > 0 && (
                          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#64748B]">
                              <span>Computed Result Data</span>
                              <span>{msg.result.table.length} Rows</span>
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
                            <span>Pandas Execution Code</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(msg.result?.pythonCode || '')}
                              className="hover:text-white underline"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="overflow-x-auto text-emerald-400 pt-1">{msg.result.pythonCode}</pre>
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
