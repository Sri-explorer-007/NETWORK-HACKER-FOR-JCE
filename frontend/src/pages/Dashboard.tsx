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
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800/90 relative overflow-hidden shadow-xl">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INTELLIGENCE &amp; FRAUD NETWORK INVESTIGATION PLATFORM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Network Hunter Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Time-aware multi-modal graph intelligence, evidence provenance verification, and grounded AI assistant for high-stakes investigations.
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <button
            onClick={() => handleOpenCase('CASE-001')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>LAUNCH OPERATION MERIDIAN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Platform Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Cases</span>
            <FolderLock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">2</div>
          <div className="text-[10px] text-slate-500 font-mono">CASE-001 &amp; CASE-002</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Entities</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">37</div>
          <div className="text-[10px] text-slate-500 font-mono">Persons, Accounts, Locations</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Relationships</span>
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">38</div>
          <div className="text-[10px] text-slate-500 font-mono">Associative Graph Edges</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Evidence Docs</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">25</div>
          <div className="text-[10px] text-slate-500 font-mono">Indexed &amp; Embedded</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Patterns</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">4</div>
          <div className="text-[10px] text-slate-500 font-mono">Conduit &amp; Nexus Findings</div>
        </div>
      </div>

      {/* 3. Primary Investigation Cases Cards */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          ACTIVE INVESTIGATION DOSSIERS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operation Meridian Card */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                  CASE-001 • NH-2026-001
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    HIGH PRIORITY
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    ACTIVE
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Operation Meridian
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Investigation into complex trade-based money laundering, maritime shipping anomalies at Dock 9, and shared financial conduits linked to Marcus Vance and Julian Thorne.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                Data Origin: <span className="text-amber-400">SYNTHETIC DEMO</span>
              </div>

              <button
                onClick={() => handleOpenCase('CASE-001')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all"
              >
                <span>Open Investigation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meridian Financial Link Card */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded">
                  CASE-002 • NH-2026-002
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                    MEDIUM PRIORITY
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    ACTIVE
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                Meridian Financial Link
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parallel inquiry into international banking shell structures and cross-case financial bridges intersecting with Julian Thorne and Zurich escrow conduits.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                Data Origin: <span className="text-amber-400">SYNTHETIC DEMO</span>
              </div>

              <button
                onClick={() => handleOpenCase('CASE-002')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all"
              >
                <span>Open Investigation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick-Action Jury Query Shortcuts */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>FAST INVESTIGATION JUMP POINTS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleRunSampleQuery('What connects Marcus Vance and Julian Thorne?')}
            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-cyan-300 mb-1">
              Marcus Vance ↔ Julian Thorne
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Inspect shared bank account A-001 and supporting mandate evidence EVD-005.
            </p>
          </button>

          <button
            onClick={() => handleRunSampleQuery('What happened between January and March?')}
            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-cyan-300 mb-1">
              Timeline Escalation Sequence
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Replay Call (Jan 10) → Meeting (Jan 15) → Wire Transfer (Jan 20).
            </p>
          </button>

          <button
            onClick={() => handleRunSampleQuery('Show David Vance')}
            className="text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all text-xs group"
          >
            <div className="font-bold text-slate-200 group-hover:text-amber-300 mb-1">
              David Vance (Ambiguity Safety)
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Demonstrates multi-candidate identity protection (P-002 vs P-011).
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
