import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const SyntheticDataBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between backdrop-blur-md z-40 select-none transition-colors shadow-sm">
      <div className="flex items-center space-x-2 font-mono tracking-tight">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-200">
          SYNTHETIC DATA — FOR DEMONSTRATION ONLY
        </span>
        <span className="text-amber-400/70 hidden sm:inline">•</span>
        <span className="text-amber-700 dark:text-amber-400/80 text-[10px] hidden sm:inline font-medium">
          PS09 Network Hunter Intelligence Platform
        </span>
      </div>

      <div className="flex items-center space-x-3 text-[10px] text-slate-600 dark:text-slate-400">
        <div className="group relative flex items-center space-x-1 cursor-help hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-mono">
          <Info className="w-3 h-3 text-amber-600 dark:text-amber-400/80" />
          <span className="underline decoration-dotted underline-offset-2">Governance Statement</span>
          <div className="absolute right-0 top-full mt-1.5 w-80 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-[11px] leading-relaxed shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <p className="font-bold text-amber-700 dark:text-amber-300 mb-1">Data Governance Notice:</p>
            Production deployment requires authorized data, access controls, audit policies, security controls, and appropriate data governance.
          </div>
        </div>
      </div>
    </div>
  );
};
