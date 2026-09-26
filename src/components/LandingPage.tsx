import React from 'react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div id="landing-page" className="min-h-screen bg-[#faf8ff] text-[#191b23] font-['Inter'] selection:bg-[#2563eb] selection:text-white">
      {/* Top Navigation Bar */}
      <nav id="landing-nav" className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-[#c3c6d7]/30 shadow-sm h-16">
        <div className="flex items-center justify-between px-4 sm:px-8 h-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <span className="material-symbols-outlined text-[#004ac6] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              analytics
            </span>
            <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#004ac6]">DataSage AI</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#workflow" className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm font-medium">
              How It Works
            </a>
            <button onClick={() => onNavigate('workspace')} className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm font-medium">
              Demo
            </button>
            <button onClick={() => onNavigate('dashboard')} className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm font-medium">
              Dashboard
            </button>
            <button onClick={() => onNavigate('preview')} className="text-[#434655] hover:text-[#004ac6] transition-colors text-sm font-medium">
              Datasets
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              id="landing-getstarted-btn"
              onClick={() => onNavigate('upload')}
              className="bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-5 py-2 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section id="hero-section" className="relative overflow-hidden px-8 py-10 lg:py-20 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#2563eb]/10 text-[#004ac6] rounded-full w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[12px] font-medium uppercase tracking-wider">AI-Powered Computation Engine</span>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#191b23] leading-tight">
                Talk to Your <span className="ai-gradient-text">Spreadsheet</span> with AI
              </h1>

              <p className="text-base sm:text-lg text-[#434655] max-w-xl leading-relaxed">
                Upload any CSV or Excel file and ask questions in plain English. Get accurate answers powered by real computations, not guesses.
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <button 
                  id="hero-upload-dataset-btn"
                  onClick={() => onNavigate('upload')}
                  className="flex items-center gap-2 bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-[#004ac6]/20 hover:scale-[1.02] active:scale-95 transition-all text-base"
                >
                  <span className="material-symbols-outlined">upload_file</span>
                  Upload Dataset
                </button>
                <button 
                  id="hero-watch-demo-btn"
                  onClick={() => onNavigate('workspace')}
                  className="flex items-center gap-2 glass-card border border-[#c3c6d7]/30 text-[#191b23] font-['Plus_Jakarta_Sans'] font-semibold px-8 py-3.5 rounded-xl shadow-sm hover:bg-white transition-all text-base"
                >
                  <span className="material-symbols-outlined text-[#004ac6]">play_circle</span>
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4 grayscale opacity-60">
                <span className="text-xs font-semibold text-[#737686] tracking-wider">TRUSTED BY TEAMS AT:</span>
                <div className="flex gap-4 font-bold text-base italic text-[#737686]">
                  TechFlow, DataVibe, CloudScale
                </div>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="relative flex justify-center items-center py-6">
              <div className="absolute inset-0 bg-[#004ac6]/5 blur-3xl rounded-full"></div>
              <div className="float-animation w-full aspect-square max-w-lg glass-card border border-white p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#ffffff]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFiDIIHNnXUFz-zT2HRpSgGeQ1wv8GBiw6hAxhZg5YGnciesw7OK9UwmrbMC5CiL0glohm67PyKSy1ZnNe_QYrtij4RCK7fWoiWbN6PmFf9NY2kJZaShV0kvcFe1UVy-uYeGeYM-SMOA4ZXQumDb0dcS_GyHz-6WFGJLiQ6li9F8H5Kr_GAlOKNJ5jmi9H8-m3jIKN4BOBxHL9XJWipSlbYj_TH4oVe58d05GrE6fMjk83pALwVaxWblJxpKzuobaQX12N0sDr5zc" 
                    alt="AI Data Pipeline Isometric Illustration" 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating AI Insights Badge */}
                  <div className="absolute bottom-4 right-4 glass-card p-4 rounded-xl shadow-lg border border-white/50 max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#00687a]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                      <span className="text-[12px] font-bold text-[#191b23]">AI Insight</span>
                    </div>
                    <p className="text-[11px] leading-tight text-[#434655]">
                      "Q4 Revenue grew by 14% compared to the projected trendline based on current CSV entries."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-[#f3f3fe]/50 py-16 px-8 border-y border-[#c3c6d7]/20">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-semibold text-[#191b23] mb-3">
                Supercharge Your Data Analysis
              </h2>
              <p className="text-base text-[#434655] max-w-2xl mx-auto">
                Skip the pivot tables and formulas. DataSage AI understands your data structure and answers your queries instantly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div 
                onClick={() => onNavigate('upload')}
                className="glass-card p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#004ac6]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#004ac6] group-hover:text-white">cloud_upload</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg text-[#191b23] mb-2">Upload Data</h3>
                <p className="text-sm text-[#434655] leading-relaxed">
                  Simply drag and drop your .csv, .xlsx, or .json files. We handle messy formatting and headers automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => onNavigate('workspace')}
                className="glass-card p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#57dffe]/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00687a] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#00687a] group-hover:text-white">chat_bubble</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg text-[#191b23] mb-2">Ask Questions</h3>
                <p className="text-sm text-[#434655] leading-relaxed">
                  "Which region had the highest growth last month?" or "Find all customers with churn risk above 20%."
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="glass-card p-8 rounded-2xl border border-[#c3c6d7]/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#bc4800]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl text-[#004ac6] group-hover:text-white">monitoring</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg text-[#191b23] mb-2">Visual Insights</h3>
                <p className="text-sm text-[#434655] leading-relaxed">
                  Automatically generate bar charts, scatter plots, and heatmaps to visualize the answers to your questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-20 px-8 max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-semibold text-[#191b23] mb-3">
              From Raw Data to Clarity in Seconds
            </h2>
            <p className="text-base text-[#434655]">
              A seamless workflow designed for researchers, analysts, and decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 cursor-pointer" onClick={() => onNavigate('upload')}>
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm">1</span>
                <span className="material-symbols-outlined text-[#004ac6] text-3xl">upload_file</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base mb-1">Upload CSV</h4>
                <p className="text-xs text-[#434655]">Drop your files or link your Google Sheets.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 cursor-pointer" onClick={() => onNavigate('preview')}>
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm">2</span>
                <span className="material-symbols-outlined text-[#004ac6] text-3xl">psychology</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base mb-1">AI Reads Data</h4>
                <p className="text-xs text-[#434655]">DataSage maps relationships and data types.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 cursor-pointer" onClick={() => onNavigate('workspace')}>
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm">3</span>
                <span className="material-symbols-outlined text-[#004ac6] text-3xl">quiz</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base mb-1">Ask Question</h4>
                <p className="text-xs text-[#434655]">Ask anything in plain conversational English.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center gap-4 cursor-pointer" onClick={() => onNavigate('workspace')}>
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm">4</span>
                <span className="material-symbols-outlined text-[#004ac6] text-3xl">task_alt</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base mb-1">Receive Answer</h4>
                <p className="text-xs text-[#434655]">Get verified results with calculation steps.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center gap-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#f3f3fe] relative hover:scale-105 transition-transform">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold text-sm">5</span>
                <span className="material-symbols-outlined text-[#004ac6] text-3xl">bar_chart</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-semibold text-base mb-1">View Charts</h4>
                <p className="text-xs text-[#434655]">Visualize the findings with one click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 py-10 max-w-[1440px] mx-auto mb-16">
          <div className="bg-[#004ac6] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#57dffe]/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-4xl font-bold mb-4 relative z-10">
              Ready to stop guessing and start knowing?
            </h2>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8 relative z-10">
              Join 10,000+ analysts using DataSage AI to make data-driven decisions faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button 
                id="cta-get-started-free"
                onClick={() => onNavigate('upload')}
                className="bg-white text-[#004ac6] font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                Get Started for Free
              </button>
              <button 
                id="cta-request-demo"
                onClick={() => onNavigate('workspace')}
                className="bg-[#2563eb] border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-[#2563eb]/80 active:scale-95 transition-all text-sm"
              >
                Request Enterprise Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f3fe] border-t border-[#c3c6d7]/30 py-12">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#004ac6] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#191b23]">DataSage AI</span>
              </div>
              <p className="text-sm text-[#434655] max-w-sm leading-relaxed">
                The world's most intuitive natural language interface for data analysis. Powered by advanced LLMs and high-integrity computation engines.
              </p>
            </div>
            <div>
              <h5 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm mb-4 text-[#191b23]">Product</h5>
              <ul className="flex flex-col gap-2 text-sm text-[#434655]">
                <li><button onClick={() => onNavigate('upload')} className="hover:text-[#004ac6] transition-colors">Import Dataset</button></li>
                <li><button onClick={() => onNavigate('preview')} className="hover:text-[#004ac6] transition-colors">Dataset Preview</button></li>
                <li><button onClick={() => onNavigate('workspace')} className="hover:text-[#004ac6] transition-colors">AI Workspace</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-[#004ac6] transition-colors">Analytics Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm mb-4 text-[#191b23]">Company</h5>
              <ul className="flex flex-col gap-2 text-sm text-[#434655]">
                <li><a className="hover:text-[#004ac6] transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-[#004ac6] transition-colors" href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-[#c3c6d7]/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#737686]">© 2026 DataSage AI. Powered by Advanced Analytics.</p>
            <div className="flex gap-6">
              <a className="text-[#737686] hover:text-[#004ac6] transition-colors" href="#"><span className="material-symbols-outlined text-xl">public</span></a>
              <a className="text-[#737686] hover:text-[#004ac6] transition-colors" href="#"><span className="material-symbols-outlined text-xl">share</span></a>
              <a className="text-[#737686] hover:text-[#004ac6] transition-colors" href="#"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
