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
  const { loading, error, refreshData, activeView, setActiveView, focusMode } = useInvestigation();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 space-y-3 font-mono select-none transition-colors">
        <div className="w-10 h-10 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin shadow-sm" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Loading Case Files &amp; Network Graph...</span>
        <span className="text-[10px] text-slate-500">Opening Operation Meridian (CASE-001)</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-rose-600 dark:text-rose-400 p-6 space-y-3 font-mono text-center select-none transition-colors">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-xs max-w-md text-slate-800 dark:text-slate-200">{error}</p>
        <button
          onClick={refreshData}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-white hover:border-cyan-400 text-xs transition-colors shadow-sm font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-100/50 dark:bg-slate-950 overflow-hidden relative font-sans select-none transition-colors">
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
      ) : activeView === 'assistant' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-100/60 dark:bg-slate-950 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">INVESTIGATION</span>
              <span className="text-slate-400">/</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">ASK AI ASSISTANT</span>
            </div>
            <button
              onClick={() => setActiveView('workspace')}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 transition-all shadow-sm font-mono flex items-center space-x-1.5"
            >
              <span>← Back to Network View</span>
            </button>
          </div>
          <InvestigationAssistant />
        </div>
      ) : (
        /* 2. Primary Standard Investigation Workspace View */
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Center Section (Expands in Focus Mode) */}
          <div className={`${focusMode ? 'h-[640px] min-h-[540px]' : 'h-[520px] min-h-[460px]'} flex border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0 transition-all`}>
            {/* Left Panel: Case Context & Entity Roster */}
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
          <div className="p-4 sm:p-6 space-y-6 bg-slate-100/60 dark:bg-slate-950 transition-colors">
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
