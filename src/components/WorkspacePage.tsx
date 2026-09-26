import React, { useState, useEffect, useRef } from 'react';
import { queryDataset, fetchDatasetPreview, QueryResult, PreviewData } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
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

const CHART_COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [activeDataset, setActiveDataset] = useState<PreviewData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDatasetPreview()
      .then((ds) => {
        setActiveDataset(ds);
        // Initial welcome message
        const initialMsg: ChatMessage = {
          id: '1',
          sender: 'ai',
          text: `Hello! I'm DataSage AI. I've loaded your spreadsheet **"${ds.name}"** containing **${ds.rowCount.toLocaleString()}** rows and **${ds.columnCount}** columns. Ask me anything in plain English!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMsg]);
      })
      .catch(() => {
        setMessages([
          {
            id: '1',
            sender: 'ai',
            text: `DataSage AI is ready. Please select or upload a dataset to begin.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      });
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

  const samplePrompts = [
    'Which region had the highest growth?',
    'What is the average profit?',
    'Show top 10 customers',
    'Plot monthly revenue',
    'Which products lost money?'
  ];

  return (
    <div id="workspace-page" className="w-full flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Central Chat Interface */}
      <section className="flex-1 flex flex-col h-full bg-white relative border-r border-[#E2E8F0] overflow-hidden">
        {/* Chat Header */}
        <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#2563EB]">auto_awesome</span>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-base text-[#0F172A]">
                Dataset Q&A Chat Workspace
              </h2>
              <p className="text-xs text-[#64748B]">
                Active: {activeDataset ? `${activeDataset.name} (${activeDataset.rowCount.toLocaleString()} rows)` : 'Loading dataset...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('preview')}
              className="px-3 py-1.5 bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] rounded-lg hover:bg-[#E2E8F0] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">table_chart</span> Dataset
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upload</span> New File
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 custom-scrollbar space-y-6 sm:space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-4 max-w-3xl mx-auto w-full">
              {msg.sender === 'user' ? (
                <>
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#E2E8F0] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#64748B] text-[20px]">person</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2563EB] text-white p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-sm font-medium">
                      {msg.text}
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block ml-1">{msg.time}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl rounded-tl-none text-[#0F172A] text-sm leading-relaxed">
                      <p className="font-medium">{msg.text}</p>
                    </div>

                    {msg.result && (
                      <div className="space-y-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
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
                                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} />
                                  </LineChart>
                                ) : (
                                  <BarChart data={msg.result.chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                    <YAxis stroke="#64748B" fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]}>
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
                          <span className="font-semibold text-[#2563EB] block">Computation Explanation:</span>
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
                          <pre className="overflow-x-auto text-emerald-400 font-mono text-[11px] leading-relaxed">
                            {msg.result.pythonCode}
                          </pre>
                        </div>

                        {/* Follow Up Questions */}
                        {msg.result.followUpQuestions && msg.result.followUpQuestions.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-semibold text-[#64748B] block mb-2">Suggested Follow-ups:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.result.followUpQuestions.map((q, qIdx) => (
                                <button
                                  key={qIdx}
                                  onClick={() => handleSend(q)}
                                  className="text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] text-[#64748B] mt-1 block ml-1">{msg.time}</span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="flex gap-4 max-w-3xl mx-auto w-full pb-6">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[#2563EB]/20 flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[#2563EB] text-[20px]">auto_awesome</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded-full"></div>
                <div className="h-4 w-full bg-slate-200 animate-pulse rounded-full"></div>
                <div className="h-4 w-2/3 bg-slate-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto relative group">
            {/* Suggestion Pills */}
            <div className="flex gap-1.5 mb-2 overflow-x-auto custom-scrollbar pb-1">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 bg-[#F1F5F9] text-xs font-medium text-[#0F172A] rounded-full hover:bg-[#E2E8F0] whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="relative flex items-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-2 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all shadow-sm">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask DataSage about your dataset (e.g. 'Which region had highest average profit?')..."
                className="flex-1 bg-transparent border-none focus:ring-0 py-2 px-3 text-sm text-[#0F172A] placeholder:text-[#64748B]"
              />

              <button 
                onClick={() => handleSend()}
                disabled={isGenerating}
                className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5 text-center">
              DataSage AI computes real Pandas statistics directly on in-memory dataset records.
            </p>
          </div>
        </div>
      </section>

      {/* Right Panel (Active Analytics Sidebar) */}
      <aside className="w-full lg:w-[300px] xl:w-[360px] bg-[#F8FAFC] h-auto lg:h-full flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-[#E2E8F0]">
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0] shrink-0">
          <span className="material-symbols-outlined text-[#2563EB] mr-2">analytics</span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
            Computation Dashboard
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {activeResult ? (
            <>
              {/* Active Chart Card */}
              {activeResult.chart && activeResult.chart.type !== 'none' && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F172A]">{activeResult.chart.title}</span>
                    <span className="text-[10px] bg-blue-100 text-[#2563EB] font-bold px-2 py-0.5 rounded uppercase">
                      {activeResult.chart.type}
                    </span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeResult.chart.data}>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Code Card */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#0F172A] block">Executed Pandas Script</span>
                <div className="bg-[#0F172A] rounded-xl p-3 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <pre>{activeResult.pythonCode}</pre>
                </div>
              </div>

              {/* Execution Specs */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dataset Rows Analyzed</span>
                  <span className="font-semibold text-[#0F172A]">{activeResult.rowsUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Execution Time</span>
                  <span className="font-semibold text-[#0F172A]">{activeResult.executionTimeMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Data Accuracy</span>
                  <span className="font-semibold text-green-600">100% Deterministic</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B]">
              <span className="material-symbols-outlined text-3xl text-[#2563EB] mb-2 block">insights</span>
              Ask a question in the chat to generate Pandas analytics, charts, and execution logs.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            View Full Statistics Dashboard
          </button>
        </div>
      </aside>
    </div>
  );
};
