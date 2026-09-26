import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { UploadPage } from './components/UploadPage';
import { DatasetPreviewPage } from './components/DatasetPreviewPage';
import { WorkspacePage } from './components/WorkspacePage';
import { DashboardPage } from './components/DashboardPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Inter'] text-[#191b23] flex flex-col antialiased">
      <Navbar activeTab={activeTab} onNavigate={handleNavigate} />
      {activeTab === 'landing' ? (
        <LandingPage onNavigate={handleNavigate} />
      ) : (
        <div className="flex flex-1 min-h-[calc(100vh-4rem)] pt-16">
          <Sidebar activeTab={activeTab} onNavigate={handleNavigate} />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            {activeTab === 'upload' && <UploadPage onNavigate={handleNavigate} />}
            {activeTab === 'preview' && <DatasetPreviewPage onNavigate={handleNavigate} />}
            {activeTab === 'workspace' && <WorkspacePage onNavigate={handleNavigate} />}
            {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          </main>
        </div>
      )}
    </div>
  );
}
