import React from 'react';
import {
  LayoutDashboard,
  Network,
  History,
  Sparkles,
  Sliders,
  ShieldCheck,
  FileCheck2,
  LucideIcon,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, activeCase, focusMode } = useInvestigation();

  const navItems: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Investigation Overview', icon: LayoutDashboard },
      ],
    },
    {
      group: 'INVESTIGATE',
      items: [
        { id: 'workspace', label: 'Investigation Workspace', icon: Network },
        { id: 'assistant', label: 'AI Assistant (LLM)', icon: Sparkles, badge: 'LLM' },
        { id: 'replay', label: 'Timeline Replay', icon: History },
        { id: 'patterns', label: 'Potential Patterns', icon: Sparkles },
        { id: 'evidence', label: 'Evidence & Provenance', icon: FileCheck2 },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Governance & Auditing', icon: Sliders, disabled: true },
      ],
    },
  ];

  if (focusMode) {
    return (
      <aside className="w-14 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between items-center py-3 select-none z-30 transition-all shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setActiveView('workspace')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'workspace'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            title="Investigation Workspace"
          >
            <Network className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('assistant')}
            className={`w-9 h-9 rounded-lg relative flex items-center justify-center transition-all ${
              activeView === 'assistant'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            title="AI Investigation Assistant (LLM)"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveView('replay')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'replay'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            title="Timeline Replay"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('patterns')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'patterns'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            title="Potential Patterns"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'dashboard'
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            title="Overview Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400/80 rotate-90 pb-4 tracking-wider">
          FOCUS
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-14 sm:w-16 lg:w-56 xl:w-60 bg-white dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between flex-shrink-0 select-none z-30 transition-all shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-center lg:justify-start space-x-2.5 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md text-white font-bold flex-shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div className="hidden lg:block truncate">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs tracking-wide text-slate-900 dark:text-white">NETWORK HUNTER</span>
              <span className="text-[9px] px-1 rounded bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                PS09
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-tighter">TIME-AWARE INTELLIGENCE</p>
          </div>
        </div>

        {/* Active Case Badge */}
        <div className="hidden lg:block p-2.5 mx-3 my-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 text-xs shadow-sm">
          <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mb-0.5">
            <span>ACTIVE CASE</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-semibold text-[9px]">
              {activeCase?.status || 'ACTIVE'}
            </span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
            {activeCase?.title || 'Operation Meridian'}
          </div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold mt-0.5">
            {activeCase?.case_number || 'NH-2026-001'}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-2 lg:px-3 space-y-2 sm:space-y-3 pt-2">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="hidden lg:block px-2 pb-1 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && setActiveView(item.id as any)}
                      disabled={item.disabled}
                      title={item.label}
                      className={`w-full flex items-center justify-between p-2 lg:px-2.5 lg:py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-semibold shadow-sm'
                          : item.disabled
                          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center space-x-0 lg:space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : item.disabled ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span className="hidden lg:inline truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="hidden lg:inline text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Prominent Quick Touch Card for AI Investigation Assistant (LLM) */}
        <div className="hidden lg:block px-3 pt-3">
          <button
            onClick={() => setActiveView('assistant')}
            className={`w-full p-2.5 rounded-xl border text-left transition-all group shadow-sm ${
              activeView === 'assistant'
                ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/50'
                : 'bg-gradient-to-r from-cyan-50/60 to-blue-50/60 dark:from-cyan-950/20 dark:to-blue-950/20 border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5 text-cyan-800 dark:text-cyan-300 font-bold text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span>Ask AI Assistant</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/80 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-500/40">
                LLM
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 leading-tight">
              Touch to open grounded LLM investigation assistant
            </p>
          </button>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center lg:items-start">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="hidden lg:inline font-mono font-medium text-slate-700 dark:text-slate-400">Guardrails Active</span>
        </div>
        <div className="hidden lg:block text-[9px] text-slate-500 mt-0.5 font-mono">
          Advisory Investigation Analysis
        </div>
      </div>
    </aside>
  );
};
