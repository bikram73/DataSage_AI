import React, { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Responsive Sidebar Drawer */}
      <aside
        id="app-sidebar"
        className={`h-[calc(100vh-4rem)] w-64 fixed left-0 top-16 bg-white/95 backdrop-blur-xl border-r border-[#c3c6d7]/20 flex flex-col p-4 gap-2 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div 
          id="sidebar-brand" 
          className="flex items-center gap-2 mb-2 px-1 cursor-pointer"
          onClick={() => handleNavClick('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              insights
            </span>
          </div>
          <div>
            <h1 className="font-bold text-[18px] text-[#004ac6] tracking-tight leading-none font-['Plus_Jakarta_Sans']">
              DataSage AI
            </h1>
            <p className="text-[12px] text-[#737686] font-medium font-['Inter']">Pro Workspace</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          id="sidebar-new-analysis-btn"
          onClick={() => handleNavClick('workspace')}
          className="w-full py-2.5 px-4 bg-[#004ac6] text-white rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all active:scale-95 mb-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Analysis
        </button>

        {/* Main Nav */}
        <nav id="sidebar-nav" className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            id="nav-item-landing"
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'landing'
                ? 'bg-[#57dffe]/30 text-[#006172] font-semibold'
                : 'text-[#434655] hover:bg-[#e1e2ed]/50'
            }`}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home Overview</span>
          </button>

          <button
            id="nav-item-workspace"
            onClick={() => handleNavClick('workspace')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-[#57dffe] text-[#006172] font-semibold shadow-sm'
                : 'text-[#434655] hover:bg-[#e1e2ed]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'workspace' ? "'FILL' 1" : "'FILL' 0" }}>
              analytics
            </span>
            <span>Workspace</span>
          </button>

          <button
            id="nav-item-upload"
            onClick={() => handleNavClick('upload')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-[#57dffe] text-[#006172] font-semibold shadow-sm'
                : 'text-[#434655] hover:bg-[#e1e2ed]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'upload' ? "'FILL' 1" : "'FILL' 0" }}>
              upload_file
            </span>
            <span>Import Data</span>
          </button>

          <button
            id="nav-item-datasets"
            onClick={() => handleNavClick('preview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-[#57dffe] text-[#006172] font-semibold shadow-sm'
                : 'text-[#434655] hover:bg-[#e1e2ed]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'preview' ? "'FILL' 1" : "'FILL' 0" }}>
              database
            </span>
            <span>Datasets</span>
          </button>

          <button
            id="nav-item-dashboard"
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#57dffe] text-[#006172] font-semibold shadow-sm'
                : 'text-[#434655] hover:bg-[#e1e2ed]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
              monitoring
            </span>
            <span>Dashboard</span>
          </button>

          <button
            id="nav-item-history"
            onClick={() => handleNavClick('workspace')}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#434655] hover:bg-[#e1e2ed]/50 rounded-lg text-[12px] font-medium transition-all"
          >
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </button>

          <button
            id="nav-item-settings"
            onClick={() => handleNavClick('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#434655] hover:bg-[#e1e2ed]/50 rounded-lg text-[12px] font-medium transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </nav>

        {/* Footer Nav */}
        <div className="mt-auto border-t border-[#c3c6d7]/20 pt-3 space-y-1">
          <a
            id="nav-item-help"
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-3 py-1.5 text-[#434655] hover:bg-[#e1e2ed]/50 rounded-lg text-[12px] font-medium transition-all"
          >
            <span className="material-symbols-outlined">help</span>
            <span>Help</span>
          </a>
        </div>
      </aside>
    </>
  );
};
