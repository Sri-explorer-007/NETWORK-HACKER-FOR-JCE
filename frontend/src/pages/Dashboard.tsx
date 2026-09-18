import React from 'react';
import {
  FolderLock,
  Users,
  Network,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useInvestigation } from '../store/InvestigationContext';

export const Dashboard: React.FC = () => {
  const { setActiveCaseId, setActiveView, runAiQuery } = useInvestigation();

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveView('workspace');
  };

  const handleRunSampleQuery = (query: string) => {
    setActiveCaseId('CASE-001');
    setActiveView('workspace');
    runAiQuery(query);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/70 dark:bg-slate-950 font-sans select-none transition-colors">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 relative overflow-hidden shadow-xl text-white">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRIMINAL INVESTIGATION &amp; EVIDENCE PLATFORM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Investigation Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Track suspect connections, search verified case files, and uncover critical evidence using AI.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={() => handleOpenCase('CASE-001')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>OPEN CASE (OPERATION MERIDIAN)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics (White boxes with silver borders in Light Mode) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Active Cases</span>
            <FolderLock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">2</div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">Case 001 &amp; Case 002</div>
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">People &amp; Assets</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">37</div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">Suspects, Accounts &amp; Places</div>
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Connections</span>
            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">38</div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">Calls, Meetings &amp; Transfers</div>
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Evidence Files</span>
            <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">25</div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">Official Records &amp; Logs</div>
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Key Findings</span>
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">4</div>
          <div className="text-[10px] text-slate-500 font-mono font-medium">Shared Accounts &amp; Meetings</div>
        </div>
      </div>

      {/* 3. Primary Investigation Cases Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          ACTIVE CASES
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operation Meridian Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 hover:border-cyan-400 dark:border-slate-800 dark:hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-sm hover:shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                  CASE-001 • NH-2026-001
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 shadow-sm">
                    HIGH PRIORITY
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm">
                    ACTIVE
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                Operation Meridian
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Investigation into money laundering, secret meetings at Dock 9, and shared bank accounts between Marcus Vance and Julian Thorne.
              </p>
            </div>

            <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                Data Origin: <span className="text-amber-700 dark:text-amber-400 font-semibold">DEMO DATASET</span>
              </div>

              <button
                onClick={() => handleOpenCase('CASE-001')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <span>Open Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meridian Financial Link Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-sm hover:shadow-md">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-800 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                  CASE-002 • NH-2026-002
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-sm">
                    MEDIUM PRIORITY
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm">
                    ACTIVE
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                Meridian Financial Link
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Investigation into overseas bank accounts and financial shell companies linked to Julian Thorne.
              </p>
            </div>

            <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                Data Origin: <span className="text-amber-700 dark:text-amber-400 font-semibold">DEMO DATASET</span>
              </div>

              <button
                onClick={() => handleOpenCase('CASE-002')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <span>Open Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick-Action Jury Query Shortcuts */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>QUICK AI QUESTIONS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleRunSampleQuery('What connects Marcus Vance and Julian Thorne?')}
            className="text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-900/90 transition-all text-xs group shadow-sm"
          >
            <div className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 mb-1">
              How are Marcus &amp; Julian connected?
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Shows the shared Chase bank account (A-001) and signed authorization form (EVD-005).
            </p>
          </button>

          <button
            onClick={() => handleRunSampleQuery('What happened between January and March?')}
            className="text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-900/90 transition-all text-xs group shadow-sm"
          >
            <div className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 mb-1">
              What happened in January?
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Step-by-step sequence: Phone call → Warehouse meeting → $250,000 wire transfer.
            </p>
          </button>

          <button
            onClick={() => handleRunSampleQuery('Show David Vance')}
            className="text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-slate-900/90 transition-all text-xs group shadow-sm"
          >
            <div className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 mb-1">
              Who is David Vance? (Name Check)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Smart identity check: Distinguishes the company manager (P-002) from an unrelated person (P-011).
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
