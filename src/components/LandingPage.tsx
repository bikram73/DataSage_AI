import React from 'react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div id="landing-page" className="min-h-screen bg-[#faf8ff] text-[#191b23] font-['Inter'] selection:bg-[#2563eb] selection:text-white pt-16">
      <main>
        {/* Hero Section */}
        <section id="hero-section" className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            <div className="flex flex-col gap-5 sm:gap-6 text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#2563eb]/10 text-[#004ac6] rounded-full w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider">AI-Powered Computation Engine</span>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-5xl lg:text-6xl font-bold text-[#191b23] leading-[1.15] tracking-tight">
                Talk to Your <span className="ai-gradient-text">Spreadsheet</span> with AI
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#434655] max-w-xl leading-relaxed">
                Upload any CSV or Excel file and ask questions in plain English. Get accurate answers powered by real computations, not guesses.
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
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">play_circle</span>
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mt-2 grayscale opacity-70">
                <span className="text-[11px] font-bold text-[#737686] tracking-wider uppercase">TRUSTED BY TEAMS AT:</span>
                <div className="flex gap-3 font-bold text-xs sm:text-sm italic text-[#737686]">
                  TechFlow, DataVibe, CloudScale
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
                      <span className="text-[11px] sm:text-[12px] font-bold text-[#191b23]">AI Insight</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] leading-tight text-[#434655]">
                      "Q4 Revenue grew by 14% compared to the projected trendline based on current CSV entries."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-[#f3f3fe]/50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-[#c3c6d7]/20">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#191b23] mb-2 sm:mb-3">
                Supercharge Your Data Analysis
              </h2>
              <p className="text-sm sm:text-base text-[#434655] max-w-2xl mx-auto">
                Skip the pivot tables and formulas. DataSage AI understands your data structure and answers your queries instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div 
                onClick={() => onNavigate('upload')}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#004ac6]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#004ac6] group-hover:text-white">cloud_upload</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base sm:text-lg text-[#191b23] mb-1.5 sm:mb-2">Upload Data</h3>
                <p className="text-xs sm:text-sm text-[#434655] leading-relaxed">
                  Simply drag and drop your .csv, .xlsx, or .json files. We handle messy formatting and headers automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => onNavigate('workspace')}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#57dffe]/30 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#00687a] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#00687a] group-hover:text-white">chat_bubble</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base sm:text-lg text-[#191b23] mb-1.5 sm:mb-2">Ask Questions</h3>
                <p className="text-xs sm:text-sm text-[#434655] leading-relaxed">
                  "Which region had the highest growth last month?" or "Find all customers with churn risk above 20%."
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#bc4800]/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#004ac6] group-hover:text-white">monitoring</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-base sm:text-lg text-[#191b23] mb-1.5 sm:mb-2">Visual Insights</h3>
                <p className="text-xs sm:text-sm text-[#434655] leading-relaxed">
                  Automatically generate bar charts, scatter plots, and heatmaps to visualize the answers to your questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#191b23] mb-2 sm:mb-3">
              From Raw Data to Clarity in Seconds
            </h2>
            <p className="text-sm sm:text-base text-[#434655]">
              A seamless workflow designed for researchers, analysts, and decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('upload')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">1</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">upload_file</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Upload CSV</h4>
                <p className="text-xs text-[#434655]">Drop your files or link your Google Sheets.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('preview')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">2</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">psychology</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">AI Reads Data</h4>
                <p className="text-xs text-[#434655]">DataSage maps relationships and data types.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('workspace')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">3</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">quiz</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Ask Question</h4>
                <p className="text-xs text-[#434655]">Ask anything in plain conversational English.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('workspace')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">4</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">task_alt</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">Receive Answer</h4>
                <p className="text-xs text-[#434655]">Get verified results with calculation steps.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-colors" onClick={() => onNavigate('dashboard')}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-xs sm:text-sm">5</span>
                <span className="material-symbols-outlined text-[#004ac6] text-2xl sm:text-3xl">bar_chart</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base mb-1">View Charts</h4>
                <p className="text-xs text-[#434655]">Visualize the findings with one click.</p>
              </div>
            </div>
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
              Join 10,000+ analysts using DataSage AI to make data-driven decisions faster than ever.
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
