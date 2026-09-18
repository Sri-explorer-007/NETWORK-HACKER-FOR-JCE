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
  Sun,
  Moon,
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
    theme,
    toggleTheme,
  } = useInvestigation();

  return (
    <header className="h-14 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl px-2 sm:px-4 flex items-center justify-between z-30 select-none transition-colors shadow-sm gap-2">
      {/* Left: Case Selector & Priority Badges */}
      <div className="flex items-center space-x-2 flex-shrink min-w-0">
        {/* Case Dropdown */}
        <div className="relative flex items-center min-w-0">
          <select
            value={activeCaseId}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:border-cyan-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer font-mono shadow-sm truncate max-w-[160px] sm:max-w-[220px] md:max-w-xs"
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
        <div className="hidden lg:flex items-center space-x-1.5 font-mono text-[10px] flex-shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm">
            {activeCase?.status || 'ACTIVE'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold shadow-sm">
            {activeCase?.priority || 'HIGH'} PRIORITY
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar (Hidden on smaller screens, expands on larger) */}
      <div className="hidden 2xl:flex flex-1 max-w-xs mx-2">
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities, accounts..."
            className="w-full bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans shadow-sm"
          />
        </div>
      </div>

      {/* Right: View Navigation, Focus Mode, Theme Switcher, Reset & Briefing */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
        {/* View Navigation Shortcuts (Adaptive on desktop) */}
        <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-mono shadow-sm">
          <button
            onClick={() => setActiveView('workspace')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'workspace'
                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Network</span>
          </button>
          <button
            onClick={() => setActiveView('assistant')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'assistant'
                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveView('replay')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'replay'
                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Replay</span>
          </button>
          <button
            onClick={() => setActiveView('evidence')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'evidence'
                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Evidence</span>
          </button>
          <button
            onClick={() => setActiveView('patterns')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              activeView === 'patterns'
                ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Patterns</span>
          </button>
        </div>

        {/* Theme Switcher Toggle (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 transition-all shadow-sm flex-shrink-0"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Presentation Controls: Focus Mode */}
        <button
          onClick={toggleFocusMode}
          title={focusMode ? 'Exit Focus Mode' : 'Enter Presentation Focus Mode'}
          className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shadow-sm flex-shrink-0 ${
            focusMode
              ? 'bg-cyan-50 dark:bg-cyan-950 border-cyan-300 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300'
              : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{focusMode ? 'Normal' : 'Focus'}</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={resetInvestigationView}
          title="Reset to Default Jury State (CASE-001 Core Nexus)"
          className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-mono transition-all shadow-sm flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </button>

        {/* Executive Investigation Briefing Modal Trigger */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border border-cyan-600 dark:border-cyan-500/40 text-white dark:text-cyan-300 text-xs font-semibold transition-all shadow-sm flex-shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-white dark:text-cyan-400" />
          <span className="hidden sm:inline">Briefing</span>
        </button>
      </div>
    </header>
  );
};
