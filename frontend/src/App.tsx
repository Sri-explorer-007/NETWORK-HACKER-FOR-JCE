import React from 'react';
import { InvestigationProvider, useInvestigation } from './store/InvestigationContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { SyntheticDataBanner } from './components/layout/SyntheticDataBanner';
import { Dashboard } from './pages/Dashboard';
import { InvestigationWorkspace } from './pages/InvestigationWorkspace';

const MainLayout: React.FC = () => {
  const { activeView } = useInvestigation();

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Global Synthetic Data Governance Banner */}
      <SyntheticDataBanner />

      {/* 2. Main Application Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation & Action Header */}
          <TopBar />

          {/* Active View: Dashboard or Investigation Workspace */}
          {activeView === 'dashboard' ? <Dashboard /> : <InvestigationWorkspace />}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InvestigationProvider>
      <MainLayout />
    </InvestigationProvider>
  );
}
