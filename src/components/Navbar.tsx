import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'landing', label: 'Overview', icon: 'explore' },
  { id: 'upload', label: 'Import Data', icon: 'upload_file' },
  { id: 'preview', label: 'Datasets', icon: 'table_chart' },
  { id: 'dashboard', label: 'Dashboard', icon: 'insights' },
  { id: 'workspace', label: 'AI Workspace', icon: 'auto_awesome' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      id="landing-nav"
      className="fixed top-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#c3c6d7]/30 shadow-xs h-16 transition-all"
    >
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-full max-w-[1440px] mx-auto gap-4">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          onClick={() => handleNav('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              analytics
            </span>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#004ac6] tracking-tight">
            DataSage AI
          </span>
        </div>

        {/* Center Desktop Segmented Tab Bar: Overview, Import Data, Datasets, Dashboard, AI Workspace */}
        <div className="hidden md:flex items-center bg-[#f1f4f9] p-1 rounded-xl border border-[#d8dce6] shadow-inner gap-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#004ac6] shadow-sm font-bold scale-[1.02]'
                    : 'text-[#434655] hover:text-[#004ac6] hover:bg-white/60 font-medium'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[17px] ${
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="landing-getstarted-btn"
            onClick={() => handleNav(activeTab === 'landing' ? 'upload' : 'workspace')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-4 py-2 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {activeTab === 'landing' ? 'rocket_launch' : 'add'}
            </span>
            <span>{activeTab === 'landing' ? 'Get Started' : 'New Analysis'}</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#434655] hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#c3c6d7]/30 px-4 py-3 shadow-lg flex flex-col gap-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#737686] px-2 py-1">
            Navigation
          </div>
          <div className="flex flex-col bg-[#f1f4f9] p-1.5 rounded-xl border border-[#d8dce6] gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-white text-[#004ac6] shadow-sm font-bold'
                      : 'text-[#434655] hover:bg-white/60 font-medium'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
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
              className="w-full py-2.5 bg-[#004ac6] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">
                {activeTab === 'landing' ? 'rocket_launch' : 'add'}
              </span>
              <span>{activeTab === 'landing' ? 'Get Started' : 'New Analysis'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
