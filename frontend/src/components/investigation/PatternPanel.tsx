import React from 'react';
import {
  Sparkles,
  CreditCard,
  Layers,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const PatternPanel: React.FC = () => {
  const { selectEntity, selectRelationship, setGraphFilter, setActiveView } = useInvestigation();

  const patterns = [
    {
      id: 'PAT-01',
      title: 'Potential Pattern: SHARED ACCOUNT',
      subtitle: 'Marcus Vance ↔ A-001 ↔ Julian Thorne',
      description:
        'Marcus Vance (P-001) and Julian Thorne (P-004) are jointly associated with Chase Manhattan Account A-001. Multiple signature mandates and wire transactions flow through this conduit.',
      entities: ['P-001', 'A-001', 'P-004'],
      relationships: ['REL-001', 'REL-002'],
      icon: CreditCard,
      actionLabel: 'Inspect Shared Account',
      onAction: () => {
        setGraphFilter('CORE_NEXUS');
        selectEntity('A-001');
        selectRelationship('REL-001');
      },
    },
    {
      id: 'PAT-02',
      title: 'Potential Pattern: CROSS-CASE CONNECTION',
      subtitle: 'Julian Thorne (CASE-001 ↕ CASE-002)',
      description:
        'Julian Thorne (P-004) establishes an active cross-case bridge across Operation Meridian (CASE-001) and Meridian Financial Link (CASE-002), connecting logistics accounts with offshore escrow.',
      entities: ['P-004'],
      relationships: ['REL-002', 'REL-014'],
      icon: Layers,
      actionLabel: 'Inspect Cross-Case Entity',
      onAction: () => {
        selectEntity('P-004');
        selectRelationship('REL-002');
      },
    },
    {
      id: 'PAT-03',
      title: 'Potential Pattern: TEMPORAL SEQUENCE',
      subtitle: 'Call → Meeting → Transaction ($250k)',
      description:
        'Observed 3-phase temporal progression: Initial communication (Jan 10) → Physical Dock 9 Meeting (Jan 15) → $250,000 Conduit Wire Transfer (Jan 20).',
      entities: ['P-001', 'P-004', 'L-001', 'A-001'],
      relationships: ['REL-001', 'REL-003'],
      icon: Clock,
      actionLabel: 'Replay Timeline Sequence',
      onAction: () => {
        setActiveView('replay');
      },
    },
    {
      id: 'PAT-04',
      title: 'Potential Pattern: SHARED LOCATION',
      subtitle: 'Warehouse Dock 9 (L-001)',
      description:
        'Photographic surveillance EVD-003 places Marcus Vance and Julian Thorne at Warehouse Dock 9 (L-001) on Jan 15 at 19:45 with vehicle V-001 on site.',
      entities: ['P-001', 'P-004', 'L-001', 'V-001'],
      relationships: ['REL-003', 'REL-004'],
      icon: MapPin,
      actionLabel: 'Inspect Recorded Location',
      onAction: () => {
        selectEntity('L-001');
        selectRelationship('REL-003');
      },
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-4 select-none transition-colors shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              POTENTIAL INVESTIGATION PATTERNS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Rule-based structural and temporal graph pattern detections.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold shadow-sm">
          Advisory Pattern Intelligence
        </span>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pat) => {
          const Icon = pat.icon;
          return (
            <div
              key={pat.id}
              className="bg-slate-50/70 hover:bg-white dark:bg-slate-950/90 dark:hover:bg-slate-900 border border-slate-200 hover:border-cyan-300 dark:border-slate-800/90 dark:hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors font-mono">
                        {pat.title}
                      </h4>
                      <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono font-semibold mt-0.5">
                        {pat.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold whitespace-nowrap shadow-sm">
                    Requires review
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
                  {pat.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Entities:</span>
                  {pat.entities.map((eid) => (
                    <button
                      key={eid}
                      onClick={() => selectEntity(eid)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-300 dark:hover:border-cyan-500 transition-colors shadow-sm font-bold"
                    >
                      {eid}
                    </button>
                  ))}
                </div>

                <button
                  onClick={pat.onAction}
                  className="flex items-center space-x-1 text-xs font-bold text-cyan-700 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors font-mono"
                >
                  <span>{pat.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
