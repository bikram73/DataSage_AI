import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      id="landing-nav"
      className="fixed top-0 left-0 right-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-[#c3c6d7]/30 shadow-xs h-16 transition-all"
    >
      <div className="flex items-center justify-between px-4 sm:px-8 h-full max-w-[1440px] mx-auto">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => handleNav('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              analytics
            </span>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#004ac6] tracking-tight">
            DataSage AI
          </span>
        </div>

        {/* Center Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3">
          <button
            onClick={() => handleNav('landing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'landing'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:text-[#004ac6] hover:bg-slate-100/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNav('workspace')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'workspace'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:text-[#004ac6] hover:bg-slate-100/60'
            }`}
          >
            AI Workspace
          </button>
          <button
            onClick={() => handleNav('preview')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preview'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:text-[#004ac6] hover:bg-slate-100/60'
            }`}
          >
            Datasets
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:text-[#004ac6] hover:bg-slate-100/60'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('upload')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:text-[#004ac6] hover:bg-slate-100/60'
            }`}
          >
            Import Data
          </button>
        </div>

        {/* Right CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="landing-getstarted-btn"
            onClick={() => handleNav(activeTab === 'landing' ? 'upload' : 'workspace')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#004ac6] text-white font-['Plus_Jakarta_Sans'] font-semibold px-4 sm:px-5 py-2 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {activeTab === 'landing' ? 'rocket_launch' : 'add'}
            </span>
            <span>{activeTab === 'landing' ? 'Get Started' : 'New Analysis'}</span>
          </button>

          {/* Mobile hamburger button */}
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#c3c6d7]/30 px-4 py-3 shadow-lg flex flex-col gap-1">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'landing'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNav('workspace')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'workspace'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:bg-slate-100'
            }`}
          >
            AI Workspace
          </button>
          <button
            onClick={() => handleNav('preview')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'preview'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:bg-slate-100'
            }`}
          >
            Datasets
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'dashboard'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('upload')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'upload'
                ? 'text-[#004ac6] bg-[#004ac6]/10 font-semibold'
                : 'text-[#434655] hover:bg-slate-100'
            }`}
          >
            Import Data
          </button>

          <div className="pt-2 mt-1 border-t border-[#c3c6d7]/20">
            <button
              onClick={() => handleNav(activeTab === 'landing' ? 'upload' : 'workspace')}
              className="w-full py-2.5 bg-[#004ac6] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
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
