import React from 'react';
import {
  Search,
  FileText,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Network,
  History,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const TopBar: React.FC = () => {
  const {
    activeCaseId,
    setActiveCaseId,
    cases,
    activeCase,
    setReportModalOpen,
    searchQuery,
    setSearchQuery,
    setActiveView,
    activeView,
    focusMode,
    toggleFocusMode,
    resetInvestigationView,
  } = useInvestigation();

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Branding & Case Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 border-r border-slate-800 pr-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-white tracking-wider">
              NETWORK HUNTER
            </div>
            <div className="text-[9px] font-mono text-cyan-400 tracking-tight">
              PS09 INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Case Dropdown */}
        <div className="relative flex items-center">
          <select
            value={activeCaseId}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="appearance-none bg-slate-950 border border-slate-700/80 text-white font-medium text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-cyan-500 hover:border-slate-600 transition-colors cursor-pointer font-mono"
          >
            {cases.length > 0 ? (
              cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}: {c.title}
                </option>
              ))
            ) : (
              <option value="CASE-001">CASE-001: Operation Meridian</option>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Status Pills */}
        <div className="hidden sm:flex items-center space-x-1.5 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
            {activeCase?.status || 'ACTIVE'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-semibold">
            {activeCase?.priority || 'HIGH'} PRIORITY
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-4">
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities, accounts, records..."
            className="w-full bg-slate-950/90 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right: View Buttons, Focus Mode, Reset & Briefing */}
      <div className="flex items-center space-x-2">
        {/* View Navigation Shortcuts */}
        <div className="hidden xl:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={() => setActiveView('workspace')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'workspace'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Network</span>
          </button>
          <button
            onClick={() => setActiveView('replay')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'replay'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Replay</span>
          </button>
          <button
            onClick={() => setActiveView('evidence')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'evidence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Evidence</span>
          </button>
          <button
            onClick={() => setActiveView('patterns')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'patterns'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Patterns</span>
          </button>
        </div>

        {/* Presentation Controls: Focus Mode & Reset View */}
        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
          <button
            onClick={toggleFocusMode}
            title={focusMode ? 'Exit Presentation Focus Mode' : 'Enter Presentation Focus Mode (Projector Optimization)'}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-mono transition-all ${
              focusMode
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{focusMode ? 'Normal View' : 'Focus Mode'}</span>
          </button>

          <button
            onClick={resetInvestigationView}
            title="Reset to Default Jury State (CASE-001 Core Nexus)"
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-300 text-xs font-mono transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset View</span>
          </button>
        </div>

        {/* Executive Investigation Briefing Modal Trigger */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Briefing</span>
        </button>
      </div>
    </header>
  );
};
