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
      title: 'Shared Bank Account (A-001)',
      subtitle: 'Marcus Vance ↔ Chase A-001 ↔ Julian Thorne',
      description:
        'Marcus Vance (P-001) and Julian Thorne (P-004) are both registered on Chase Account A-001. Official bank signature mandates confirm Marcus Vance is the beneficial owner and Julian Thorne is the authorized trading transactor.',
      entities: ['P-001', 'A-001', 'P-004'],
      relationships: ['REL-001', 'REL-002'],
      icon: CreditCard,
      actionLabel: 'Inspect on Graph',
      onAction: () => {
        setGraphFilter('CORE_NEXUS');
        selectEntity('A-001');
        selectRelationship('REL-001');
      },
    },
    {
      id: 'PAT-02',
      title: 'Cross-Case Suspect Link',
      subtitle: 'Julian Thorne (Operation Meridian ↔ Case 002)',
      description:
        'Julian Thorne establishes a direct bridge between Operation Meridian (CASE-001) and the offshore escrow accounts in Case 002.',
      entities: ['P-004'],
      relationships: ['REL-002', 'REL-014'],
      icon: Layers,
      actionLabel: 'Inspect Cross-Case Link',
      onAction: () => {
        selectEntity('P-004');
        selectRelationship('REL-002');
      },
    },
    {
      id: 'PAT-03',
      title: 'Suspect Timeline: Call → Meeting → Wire',
      subtitle: 'Jan 10 (Call) → Jan 15 (Dock 9 Meeting) → Jan 20 ($250k Wire)',
      description:
        'A 3-step sequence: Phone call on Jan 10, physical meeting at Warehouse Dock 9 on Jan 15, followed by a $250,000 wire transfer on Jan 20.',
      entities: ['P-001', 'P-004', 'L-001', 'A-001'],
      relationships: ['REL-001', 'REL-003'],
      icon: Clock,
      actionLabel: 'Play Case Timeline',
      onAction: () => {
        setActiveView('replay');
      },
    },
    {
      id: 'PAT-04',
      title: 'Confirmed In-Person Meeting',
      subtitle: 'Warehouse Dock 9 (Jan 15, 19:45)',
      description:
        'Surveillance photographs verify that Marcus Vance and Julian Thorne met at Warehouse Dock 9 on Jan 15 at 19:45 with vehicle V-001 on site.',
      entities: ['P-001', 'P-004', 'L-001', 'V-001'],
      relationships: ['REL-003', 'REL-004'],
      icon: MapPin,
      actionLabel: 'Inspect Meeting Site',
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
              Key Suspect Links &amp; Findings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Critical connections detected across bank accounts, phone calls, and secret meetings.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold shadow-sm">
          Verified Evidence Links
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
                    Verified Link
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
                  {pat.description}
                </p>
              </div>

              {/* Action Button & Entity Tag List */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Linked:</span>
                  <div className="flex flex-wrap gap-1">
                    {pat.entities.map((eid) => (
                      <span key={eid} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-bold">
                        {eid}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={pat.onAction}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 border border-cyan-600 dark:border-cyan-500/30 text-white dark:text-cyan-300 font-semibold text-xs transition-colors shadow-sm font-mono self-end sm:self-auto"
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
