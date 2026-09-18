import React from 'react';
import { useInvestigation } from '../store/InvestigationContext';
import { CaseContextPanel } from '../components/investigation/CaseContextPanel';
import { NetworkGraph } from '../components/investigation/NetworkGraph';
import { EvidencePanel } from '../components/investigation/EvidencePanel';
import { InvestigationReplay } from '../components/investigation/InvestigationReplay';
import { PatternPanel } from '../components/investigation/PatternPanel';
import { InvestigationAssistant } from '../components/investigation/InvestigationAssistant';
import { ReportPreview } from '../components/investigation/ReportPreview';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const InvestigationWorkspace: React.FC = () => {
  const { loading, error, refreshData, activeView, focusMode } = useInvestigation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-3 font-mono select-none">
        <div className="w-9 h-9 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-300">Synchronizing Knowledge Graph &amp; Evidence Records...</span>
        <span className="text-[10px] text-slate-500">Connecting to Operation Meridian (CASE-001)</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-rose-400 p-6 space-y-3 font-mono text-center select-none">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-xs max-w-md text-slate-200">{error}</p>
        <button
          onClick={refreshData}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-500 text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden relative font-sans select-none">
      {/* 1. Dedicated Full Sub-View Tabs */}
      {activeView === 'patterns' ? (
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <PatternPanel />
        </div>
      ) : activeView === 'replay' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <NetworkGraph />
          </div>
          <InvestigationReplay />
        </div>
      ) : activeView === 'evidence' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative">
              <NetworkGraph />
            </div>
            <EvidencePanel />
          </div>
          <InvestigationReplay />
        </div>
      ) : (
        /* 2. Primary Standard Investigation Workspace View */
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Center Section (Expands in Focus Mode) */}
          <div className={`${focusMode ? 'h-[640px] min-h-[540px]' : 'h-[520px] min-h-[460px]'} flex border-b border-slate-800/80 flex-shrink-0 transition-all`}>
            {/* Left Panel: Case Context & Entity Roster (collapsed in focus mode if desired) */}
            {!focusMode && <CaseContextPanel />}

            {/* Center: Interactive Knowledge Graph */}
            <div className="flex-1 relative overflow-hidden">
              <NetworkGraph />
            </div>

            {/* Right Panel: Evidence & Provenance Inspector */}
            <EvidencePanel />
          </div>

          {/* Time-Aware Investigation Replay Bar */}
          <InvestigationReplay />

          {/* Bottom Section: AI Grounded Investigation Assistant & Pattern Detection */}
          <div className="p-4 sm:p-5 space-y-5 bg-slate-950">
            {/* AI Assistant */}
            <InvestigationAssistant />

            {/* Pattern Detection Cards */}
            <PatternPanel />
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportPreview />
    </div>
  );
};
