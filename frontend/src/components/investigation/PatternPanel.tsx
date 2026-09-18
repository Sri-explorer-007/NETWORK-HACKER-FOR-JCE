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
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
              POTENTIAL INVESTIGATION PATTERNS
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Rule-based structural and temporal graph pattern detections.
            </p>
          </div>
        </div>

        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
          Advisory Pattern Intelligence
        </span>
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {patterns.map((pat) => {
          const Icon = pat.icon;
          return (
            <div
              key={pat.id}
              className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-1.5 gap-2">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-mono">
                        {pat.title}
                      </h4>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {pat.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold whitespace-nowrap">
                    Requires review
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
                  {pat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-[9px] font-mono text-slate-400">
                  <span>Entities:</span>
                  {pat.entities.map((eid) => (
                    <button
                      key={eid}
                      onClick={() => selectEntity(eid)}
                      className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500 transition-colors"
                    >
                      {eid}
                    </button>
                  ))}
                </div>

                <button
                  onClick={pat.onAction}
                  className="flex items-center space-x-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                >
                  <span>{pat.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
