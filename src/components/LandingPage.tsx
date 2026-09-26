import React, { useState } from 'react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

interface ShowcaseQuery {
  id: string;
  category: string;
  question: string;
  dataset: string;
  answerSummary: string;
  tableData: Record<string, any>[];
  metricBadge: string;
  pythonSnippet: string;
}

const SHOWCASE_QUERIES: ShowcaseQuery[] = [
  {
    id: 'q1',
    category: 'Sales Analytics',
    question: 'What is the total sales and average profit margin by region?',
    dataset: 'Sales_Report.csv (1,000 rows)',
    answerSummary: 'North America generated the highest sales ($482,150) with an average profit margin of 28.4%, followed by Europe ($315,400, 24.1%).',
    tableData: [
      { Region: 'North America', Total_Sales: '$482,150', Avg_Margin: '28.4%', Transactions: 412 },
      { Region: 'Europe', Total_Sales: '$315,400', Avg_Margin: '24.1%', Transactions: 289 },
      { Region: 'Asia-Pacific', Total_Sales: '$268,900', Avg_Margin: '22.8%', Transactions: 215 },
      { Region: 'Latin America', Total_Sales: '$98,200', Avg_Margin: '19.5%', Transactions: 84 },
    ],
    metricBadge: '4 Groups • 120ms Latency',
    pythonSnippet: `df.groupby('Region').agg(
    Total_Sales=('Sales', 'sum'),
    Avg_Margin=('Margin', 'mean'),
    Transactions=('Sales', 'count')
).reset_index()`,
  },
  {
    id: 'q2',
    category: 'HR & Compensation',
    question: 'Compare average salary and median experience by department',
    dataset: 'HR_Employee_Analytics.csv (500 rows)',
    answerSummary: 'Engineering leads with an average salary of $128,450 (median experience 6.2 yrs), followed by Product ($118,200, 5.8 yrs).',
    tableData: [
      { Department: 'Engineering', Avg_Salary: '$128,450', Median_Exp: '6.2 yrs', Headcount: 142 },
      { Department: 'Product', Avg_Salary: '$118,200', Median_Exp: '5.8 yrs', Headcount: 68 },
      { Department: 'Marketing', Avg_Salary: '$94,300', Median_Exp: '4.5 yrs', Headcount: 95 },
      { Department: 'Sales', Avg_Salary: '$89,600', Median_Exp: '4.1 yrs', Headcount: 135 },
      { Department: 'Operations', Avg_Salary: '$76,500', Median_Exp: '3.8 yrs', Headcount: 60 },
    ],
    metricBadge: '5 Departments • Exact Median',
    pythonSnippet: `df.groupby('Department').agg(
    Avg_Salary=('Salary', 'mean'),
    Median_Exp=('Experience', 'median'),
    Headcount=('Salary', 'count')
).sort_values('Avg_Salary', ascending=False)`,
  },
  {
    id: 'q3',
    category: 'Marketing ROI',
    question: 'Identify top 4 marketing campaigns by Return on Ad Spend (ROAS)',
    dataset: 'Marketing_Campaign_ROI.csv (350 rows)',
    answerSummary: 'The "Summer Retention Push" campaign achieved the highest ROAS at 4.82x with $84,200 in conversions on $17,450 spend.',
    tableData: [
      { Campaign: 'Summer Retention Push', Spend: '$17,450', Revenue: '$84,200', ROAS: '4.82x' },
      { Campaign: 'Search Ads Q3', Spend: '$24,000', Revenue: '$102,500', ROAS: '4.27x' },
      { Campaign: 'Influencer Collab v2', Spend: '$12,800', Revenue: '$49,600', ROAS: '3.88x' },
      { Campaign: 'Email Newsletter Drip', Spend: '$4,500', Revenue: '$16,200', ROAS: '3.60x' },
    ],
    metricBadge: 'Top 4 Filter • Calculated Ratios',
    pythonSnippet: `df['ROAS'] = df['Revenue'] / df['Spend']
df.nlargest(4, 'ROAS')[['Campaign', 'Spend', 'Revenue', 'ROAS']]`,
  },
  {
    id: 'q4',
    category: 'Risk & Loss Prevention',
    question: 'Find all loss-making product categories and total negative impact',
    dataset: 'Sales_Report.csv (1,000 rows)',
    answerSummary: 'Found 3 sub-categories operating at a net deficit, generating a combined total loss of -$24,680 across 64 discounted transactions.',
    tableData: [
      { Sub_Category: 'Discounted Clearance Audio', Orders: 28, Net_Profit: '-$12,400', Return_Rate: '14.2%' },
      { Sub_Category: 'Legacy Cable Bundles', Orders: 21, Net_Profit: '-$7,850', Return_Rate: '9.8%' },
      { Sub_Category: 'Sample Merch Kits', Orders: 15, Net_Profit: '-$4,430', Return_Rate: '6.1%' },
    ],
    metricBadge: 'Negative Filter • Strict Null Pruning',
    pythonSnippet: `loss_df = df[df['Profit'] < 0]
loss_df.groupby('Sub_Category')['Profit'].sum().reset_index()`,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>('q1');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeShowcase = SHOWCASE_QUERIES.find((q) => q.id === selectedQueryId) || SHOWCASE_QUERIES[0];

  const faqs = [
    {
      q: 'How does DataSage AI eliminate calculation hallucinations?',
      a: 'Unlike standard chatbots that attempt to mentally calculate math in text tokens (which leads to a 40-60% error rate), DataSage AI uses a dual-engine architecture: the AI parses your natural language intent into an execution plan, while our deterministic in-memory computational engine runs real mathematical aggregations (exact sums, medians, standard deviations, and group-by operations) directly on your dataset rows.',
    },
    {
      q: 'Is my spreadsheet data kept private and secure?',
      a: 'Yes. Your uploaded CSV and Excel datasets are processed in-memory within your active session environment. No raw customer rows or private financial records are stored permanently on third-party servers or used for model training.',
    },
    {
      q: 'What file formats and dataset sizes are supported?',
      a: 'DataSage AI supports CSV, TSV, XLS, XLSX, and JSON files up to 100MB and over 100,000+ rows. The engine automatically infers headers, removes malformed delimiters, and classifies column data types (Integer, Float, Date, String).',
    },
    {
      q: 'Can I download and export the calculated answers?',
      a: 'Absolutely! Every single analysis includes one-click export options: Download Table as CSV (.csv), Export Full Payload as JSON (.json), Generate a complete Markdown Report (.md), and copy/download the auditable Python Pandas script.',
    },
    {
      q: 'Do I need Python or SQL knowledge to use DataSage AI?',
      a: 'Not at all! You can ask questions in conversational English (e.g. "What was our highest growth channel last quarter?" or "Which 5 products have negative profit?"). DataSage automatically outputs the answers, tables, charts, and also provides the Python script for developers who want code auditability.',
    },
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-[#faf8ff] text-[#191b23] font-['Inter'] selection:bg-[#2563eb] selection:text-white pt-16">
      <main>
        {/* Hero Section */}
        <section id="hero-section" className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            <div className="flex flex-col gap-5 sm:gap-6 text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#2563eb]/10 text-[#004ac6] rounded-full w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider">Deterministic AI Computation Engine</span>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-5xl lg:text-6xl font-bold text-[#191b23] leading-[1.15] tracking-tight">
                Talk to Your <span className="ai-gradient-text">Spreadsheet</span> with AI
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#434655] max-w-xl leading-relaxed">
                Upload any CSV or Excel file and ask questions in plain English. Get guaranteed accurate calculations, interactive tables, charts, and downloadable reports in milliseconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
                <button 
                  id="hero-upload-dataset-btn"
                  onClick={() => onNavigate('upload')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:shadow-[#004ac6]/20 hover:scale-[1.02] active:scale-95 transition-all text-sm sm:text-base min-h-[48px]"
                >
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Upload Dataset</span>
                </button>
                <button 
                  id="hero-watch-demo-btn"
                  onClick={() => onNavigate('workspace')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 glass-card border border-[#c3c6d7]/40 text-[#191b23] font-['Plus_Jakarta_Sans'] font-semibold px-6 sm:px-8 py-3.5 rounded-xl shadow-2xs hover:bg-white transition-all text-sm sm:text-base min-h-[48px]"
                >
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">auto_awesome</span>
                  <span>Open AI Workspace</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-2 pt-2 border-t border-[#c3c6d7]/30 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  <span>100% Math Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[#004ac6] text-[18px]">bolt</span>
                  <span>Sub-150ms Execution</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-purple-600 text-[18px]">lock</span>
                  <span>In-Memory Privacy</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="relative flex justify-center items-center py-4 sm:py-6">
              <div className="absolute inset-0 bg-[#004ac6]/5 blur-3xl rounded-full"></div>
              <div className="float-animation w-full aspect-square max-w-sm sm:max-w-md lg:max-w-lg glass-card border border-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col gap-4">
                <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#ffffff]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFiDIIHNnXUFz-zT2HRpSgGeQ1wv8GBiw6hAxhZg5YGnciesw7OK9UwmrbMC5CiL0glohm67PyKSy1ZnNe_QYrtij4RCK7fWoiWbN6PmFf9NY2kJZaShV0kvcFe1UVy-uYeGeYM-SMOA4ZXQumDb0dcS_GyHz-6WFGJLiQ6li9F8H5Kr_GAlOKNJ5jmi9H8-m3jIKN4BOBxHL9XJWipSlbYj_TH4oVe58d05GrE6fMjk83pALwVaxWblJxpKzuobaQX12N0sDr5zc" 
                    alt="AI Data Pipeline Isometric Illustration" 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating AI Insights Badge */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 glass-card p-3 sm:p-4 rounded-xl shadow-lg border border-white/60 max-w-[240px] sm:max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[#00687a] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                      <span className="text-[11px] sm:text-[12px] font-bold text-[#191b23]">Real-time Computation</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] leading-tight text-[#434655]">
                      "Regional revenue aggregated with zero hallucination. 1,000 records processed in 12ms."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Query Showcase Sandbox */}
        <section id="interactive-showcase" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#004ac6] rounded-full text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span>Interactive Demonstration</span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191b23] mb-2 sm:mb-3">
              See How DataSage AI Answers Questions
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#434655] max-w-2xl mx-auto">
              Select a sample business query below to inspect the verified answers, computed summary tables, and Python Pandas blueprints.
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6 lg:p-8">
            {/* Query Selector Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
              {SHOWCASE_QUERIES.map((sq) => {
                const isSelected = sq.id === selectedQueryId;
                return (
                  <button
                    key={sq.id}
                    onClick={() => setSelectedQueryId(sq.id)}
                    className={`p-3 sm:p-3.5 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-md scale-[1.01]'
                        : 'bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border-[#E2E8F0]'
                    }`}
                  >
                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                      isSelected ? 'text-blue-200' : 'text-[#64748B]'
                    }`}>
                      {sq.category}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug">
                      "{sq.question}"
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Showcase Output Box */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 space-y-4">
              {/* Question Header & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#004ac6] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                  </span>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-[#0F172A]">
                      {activeShowcase.question}
                    </h3>
                    <p className="text-xs text-[#64748B]">Dataset: {activeShowcase.dataset}</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {activeShowcase.metricBadge}
                </span>
              </div>

              {/* Synthesized Answer Summary */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] leading-relaxed flex items-start gap-2.5 shadow-2xs">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px] shrink-0 mt-0.5">auto_awesome</span>
                <div>
                  <span className="font-bold text-[#004ac6] block mb-0.5">Verified Calculation Result:</span>
                  <span>{activeShowcase.answerSummary}</span>
                </div>
              </div>

              {/* Tabular Output */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-50 px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#64748B]">
                  <span>Computed Data Table</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
                    {activeShowcase.tableData.length} records
                  </span>
                </div>
                <div className="overflow-x-auto touch-scroll max-h-48 custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs min-w-[400px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                        {Object.keys(activeShowcase.tableData[0]).map((key, i) => (
                          <th key={i} className="p-2.5 whitespace-nowrap">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {activeShowcase.tableData.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#F8FAFC]">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-2.5 font-medium text-[#0F172A] whitespace-nowrap">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Python Code Blueprint */}
              <div className="bg-[#0F172A] rounded-xl p-3 sm:p-4 text-white text-xs font-mono relative">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 border-b border-slate-700 pb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <span className="material-symbols-outlined text-[12px] text-emerald-400">code</span>
                    <span>Auditable Python Pandas Execution Blueprint</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold">100% Deterministic</span>
                </div>
                <pre className="overflow-x-auto text-emerald-400 text-[10px] sm:text-[11px] leading-relaxed pt-1">
                  {activeShowcase.pythonSnippet}
                </pre>
              </div>

              {/* Try It Live Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('workspace')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#004ac6] text-white rounded-xl text-xs font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs min-h-[40px]"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Try Asking Your Own Question in AI Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section: DataSage AI vs Excel vs Pure LLM */}
        <section id="comparison" className="bg-[#f3f3fe]/60 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-[#c3c6d7]/30">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-full text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-sm">balance</span>
                <span>Why DataSage AI?</span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191b23] mb-2 sm:mb-3">
                How We Compare to Alternatives
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#434655] max-w-2xl mx-auto">
                Discover why analytical teams choose DataSage AI over traditional spreadsheets and ungrounded chatbot assistants.
              </p>
            </div>

            <div className="overflow-x-auto touch-scroll custom-scrollbar">
              <table className="w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="p-4 text-xs font-bold text-[#64748B] uppercase w-1/4">Key Capability</th>
                    <th className="p-4 text-xs font-bold text-[#64748B] uppercase w-1/4">Traditional Excel / Sheets</th>
                    <th className="p-4 text-xs font-bold text-[#64748B] uppercase w-1/4">Pure Generic LLMs (ChatGPT)</th>
                    <th className="p-4 text-xs font-bold text-[#004ac6] uppercase bg-blue-50/70 w-1/4">DataSage AI Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs sm:text-sm">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-[#0F172A]">Query Interface</td>
                    <td className="p-4 text-[#64748B]">Manual VLOOKUP, INDEX/MATCH, Pivot Tables</td>
                    <td className="p-4 text-[#64748B]">Natural language prompt</td>
                    <td className="p-4 font-semibold text-[#004ac6] bg-blue-50/30">Natural English + Auto-suggestions</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-[#0F172A]">Math Precision</td>
                    <td className="p-4 text-emerald-600 font-medium">Exact (if formulas written correctly)</td>
                    <td className="p-4 text-red-600 font-medium">Frequent hallucinations on math (40%+ error)</td>
                    <td className="p-4 font-semibold text-emerald-600 bg-blue-50/30">100% Deterministic Verified Math</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-[#0F172A]">Execution Speed</td>
                    <td className="p-4 text-[#64748B]">Slow & crashes on 50k+ rows</td>
                    <td className="p-4 text-[#64748B]">5 - 15 seconds token streaming</td>
                    <td className="p-4 font-semibold text-[#004ac6] bg-blue-50/30">Sub-150ms In-Memory Engine</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-[#0F172A]">Data Privacy</td>
                    <td className="p-4 text-[#64748B]">Local file storage</td>
                    <td className="p-4 text-red-600 font-medium">Raw data sent & logged in LLM context</td>
                    <td className="p-4 font-semibold text-emerald-600 bg-blue-50/30">Private Session Sandbox (Zero Leak)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-[#0F172A]">One-Click Export</td>
                    <td className="p-4 text-[#64748B]">Manual copy-paste required</td>
                    <td className="p-4 text-[#64748B]">Markdown text only</td>
                    <td className="p-4 font-semibold text-[#004ac6] bg-blue-50/30">CSV, JSON, Markdown Report & Python Script</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6 Core Analytical Capabilities Bento */}
        <section id="analytical-capabilities" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191b23] mb-2 sm:mb-3">
              Comprehensive Analytical Capabilities
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#434655] max-w-2xl mx-auto">
              Everything you need to turn raw data into executive-ready intelligence in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004ac6] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">calculate</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  Aggregations & Grand Totals
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Compute overall sums, averages, counts, min/max values across all rows with automated numeric column resolution and null filtering.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-[#004ac6]">
                e.g. "What is the total sales revenue?"
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0891B2] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">table_chart</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  Multi-Dimensional GroupBy
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Slice and dice data by category, region, department, or date. Calculates percentage shares and group-level totals instantly.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-[#0891B2]">
                e.g. "Total profit by product category"
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">leaderboard</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  Top-N & Bottom-N Leaderboards
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Discover your top performers, best selling products, or lowest margin regions with dynamic sorting and row limits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-purple-700">
                e.g. "Top 5 customers by revenue"
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">filter_alt</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  Loss Prevention & Risk Filters
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Identify deficit products, negative margin entries, high-churn risks, and anomalous outliers in a single question.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-700">
                e.g. "Find all loss-making items"
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  5-Number Statistical Matrix
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Full descriptive statistics including mean, standard deviation, min, 25th percentile, true median, 75th percentile, and maximum.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700">
                e.g. "Show statistical distribution for Salary"
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#004ac6] hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">file_download</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#0F172A] mb-1.5">
                  Multi-Format Download & Reports
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Download results as formatted CSV files, structured JSON data, professional Markdown reports, or copy straight to Excel clipboard.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-rose-700">
                e.g. One-click CSV / JSON / MD export
              </div>
            </div>
          </div>
        </section>

        {/* Workflow 5 Steps */}
        <section id="workflow" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto bg-white rounded-3xl border border-[#E2E8F0] my-8 shadow-xs">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#191b23] mb-2 sm:mb-3">
              From Raw Data to Clarity in Seconds
            </h2>
            <p className="text-sm sm:text-base text-[#434655]">
              A seamless workflow designed for researchers, analysts, and decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('upload')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">1</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">upload_file</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Upload File</h4>
                <p className="text-xs text-[#434655]">Drop your CSV, Excel, or sample dataset.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('preview')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">2</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">psychology</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">AI Ingestion</h4>
                <p className="text-xs text-[#434655]">Auto-detects columns, data types & statistics.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('workspace')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">3</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">quiz</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Ask in English</h4>
                <p className="text-xs text-[#434655]">Ask anything in plain conversational text.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('workspace')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">4</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">task_alt</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Receive Answer</h4>
                <p className="text-xs text-[#434655]">Instant verified calculation & table.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('dashboard')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">5</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">bar_chart</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Export & Charts</h4>
                <p className="text-xs text-[#434655]">Visualize and download CSV / Reports.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191b23] mb-2 sm:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#434655]">
              Everything you need to know about DataSage AI's calculation guarantees and features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base text-[#0F172A] flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[#004ac6] shrink-0 transition-transform duration-200">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#434655] leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-[1440px] mx-auto mb-10 sm:mb-16">
          <div className="bg-[#004ac6] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#57dffe]/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 relative z-10">
              Ready to stop guessing and start knowing?
            </h2>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-6 sm:mb-8 relative z-10">
              Join thousands of analysts using DataSage AI to make data-driven decisions faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10 w-full sm:w-auto">
              <button 
                id="cta-get-started-free"
                onClick={() => onNavigate('upload')}
                className="w-full sm:w-auto bg-white text-[#004ac6] font-bold px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-xs sm:text-sm min-h-[44px]"
              >
                Get Started for Free
              </button>
              <button 
                id="cta-request-demo"
                onClick={() => onNavigate('workspace')}
                className="w-full sm:w-auto bg-[#2563eb] border border-white/20 text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:bg-[#2563eb]/80 active:scale-95 transition-all text-xs sm:text-sm min-h-[44px]"
              >
                Open AI Workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f3fe] border-t border-[#c3c6d7]/30 py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#004ac6] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#191b23]">DataSage AI</span>
              </div>
              <p className="text-xs sm:text-sm text-[#434655] max-w-sm leading-relaxed">
                The world's most intuitive natural language interface for data analysis. Powered by advanced LLMs and high-integrity computation engines.
              </p>
            </div>
            <div>
              <h5 className="font-['Plus_Jakarta_Sans'] font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-[#191b23]">Product</h5>
              <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[#434655]">
                <li><button onClick={() => onNavigate('upload')} className="hover:text-[#004ac6] transition-colors py-0.5">Import Dataset</button></li>
                <li><button onClick={() => onNavigate('preview')} className="hover:text-[#004ac6] transition-colors py-0.5">Dataset Preview</button></li>
                <li><button onClick={() => onNavigate('workspace')} className="hover:text-[#004ac6] transition-colors py-0.5">AI Workspace</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-[#004ac6] transition-colors py-0.5">Analytics Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-['Plus_Jakarta_Sans'] font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-[#191b23]">Company</h5>
              <ul className="flex flex-col gap-2 text-xs sm:text-sm text-[#434655]">
                <li><a className="hover:text-[#004ac6] transition-colors py-0.5 inline-block" href="#">About Us</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors py-0.5 inline-block" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors py-0.5 inline-block" href="#">Terms of Service</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors py-0.5 inline-block" href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-[#c3c6d7]/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-xs text-[#737686]">© 2026 DataSage AI. Powered by Advanced Analytics.</p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/bikram73/DataSage_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#434655] hover:text-[#004ac6] hover:bg-white/90 border border-[#c3c6d7]/40 shadow-xs transition-all duration-200 group min-h-[36px]"
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
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
