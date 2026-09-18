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
      <aside className="w-14 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between items-center py-3 select-none z-30 transition-all">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setActiveView('workspace')}
            className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20"
            title="Investigation Workspace"
          >
            <Network className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('replay')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'replay' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Timeline Replay"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('patterns')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'patterns' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Potential Patterns"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              activeView === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Overview Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[9px] font-mono text-cyan-400/80 rotate-90 pb-4 tracking-wider">
          FOCUS
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0 select-none z-30 transition-all">
      {/* Brand Header */}
      <div>
        <div className="p-3.5 border-b border-slate-800/80 flex items-center space-x-2.5 bg-slate-900/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-slate-950 font-bold">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs tracking-wide text-white">NETWORK HUNTER</span>
              <span className="text-[9px] px-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                PS09
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono tracking-tighter">TIME-AWARE INTELLIGENCE</p>
          </div>
        </div>

        {/* Active Case Badge */}
        <div className="p-2.5 mx-3 my-2.5 rounded-lg bg-slate-900/90 border border-cyan-500/20 text-xs">
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono uppercase tracking-wider mb-0.5">
            <span>ACTIVE CASE</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-semibold text-[9px]">
              {activeCase?.status || 'ACTIVE'}
            </span>
          </div>
          <div className="font-semibold text-white truncate text-xs">
            {activeCase?.title || 'Operation Meridian'}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
            {activeCase?.case_number || 'NH-2026-001'}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 space-y-3.5 pt-1">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="px-2 pb-1 text-[9px] font-mono font-semibold text-slate-500 tracking-wider">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => !item.disabled && setActiveView(item.id as any)}
                      disabled={item.disabled}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : item.disabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.disabled ? 'text-slate-700' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 bg-slate-950">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="font-mono text-slate-400">Grounding Guardrails Active</span>
        </div>
        <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
          Advisory Investigation Analysis
        </div>
      </div>
    </aside>
  );
};
