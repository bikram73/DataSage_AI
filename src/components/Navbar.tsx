import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'landing', label: 'Overview', shortLabel: 'Home', icon: 'explore' },
  { id: 'upload', label: 'Import Data', shortLabel: 'Import', icon: 'upload_file' },
  { id: 'preview', label: 'Datasets', shortLabel: 'Data', icon: 'table_chart' },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dash', icon: 'insights' },
  { id: 'workspace', label: 'AI Workspace', shortLabel: 'AI Chat', icon: 'auto_awesome' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <nav
        id="landing-nav"
        className="fixed top-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#c3c6d7]/30 shadow-2xs h-16 transition-all"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-full max-w-[1440px] mx-auto gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0 min-h-[44px]"
            onClick={() => handleNav('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-[#004ac6] tracking-tight">
              DataSage AI
            </span>
          </div>

          {/* Desktop & Tablet Segmented Tab Bar */}
          <div className="hidden md:flex items-center bg-[#f1f4f9] p-1 rounded-xl border border-[#d8dce6] shadow-inner gap-0.5 max-w-full overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 shrink-0 min-h-[36px] ${
                    isActive
                      ? 'bg-white text-[#004ac6] shadow-xs font-bold scale-[1.02]'
                      : 'text-[#434655] hover:text-[#004ac6] hover:bg-white/60 font-medium'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] lg:text-[18px] ${
                      isActive ? 'text-[#004ac6]' : 'text-[#737686]'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              id="landing-getstarted-btn"
              onClick={() => handleNav(activeTab === 'landing' ? 'upload' : 'workspace')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-3.5 sm:px-4 py-2 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm min-h-[40px]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {activeTab === 'landing' ? 'rocket_launch' : 'add'}
              </span>
              <span className="hidden lg:inline">{activeTab === 'landing' ? 'Get Started' : 'New Analysis'}</span>
              <span className="lg:hidden">{activeTab === 'landing' ? 'Start' : 'New'}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#434655] hover:bg-slate-100 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-[#c3c6d7]/30 px-4 py-3 shadow-xl z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#737686] px-2 py-0.5">
                Navigation
              </div>
              <div className="flex flex-col bg-[#f1f4f9] p-1.5 rounded-xl border border-[#d8dce6] gap-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-white text-[#004ac6] shadow-xs font-bold'
                          : 'text-[#434655] hover:bg-white/60 font-medium'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isActive ? 'text-[#004ac6]' : 'text-[#737686]'
                        }`}
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-1 border-t border-[#c3c6d7]/20">
                <button
                  onClick={() => handleNav(activeTab === 'landing' ? 'upload' : 'workspace')}
                  className="w-full py-3 bg-[#004ac6] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {activeTab === 'landing' ? 'rocket_launch' : 'add'}
                  </span>
                  <span>{activeTab === 'landing' ? 'Get Started Free' : 'New AI Analysis'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar (Ultra-responsive one-thumb tab switching) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E2E8F0] shadow-lg px-1.5 py-1 flex justify-around items-center h-15">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={`bottom-${item.id}`}
              onClick={() => handleNav(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
                isActive
                  ? 'text-[#004ac6] font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A] font-medium'
              }`}
            >
              <div
                className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-[#eff4ff]' : ''
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
              </div>
              <span className="text-[10px] leading-tight tracking-tight mt-0.5">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

