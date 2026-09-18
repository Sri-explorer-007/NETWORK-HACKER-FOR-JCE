import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const SyntheticDataBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1 text-xs text-amber-300 flex items-center justify-between backdrop-blur-md z-40 select-none">
      <div className="flex items-center space-x-2 font-mono tracking-tight">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-200">
          SYNTHETIC DATA — FOR DEMONSTRATION ONLY
        </span>
        <span className="text-amber-500/70 hidden sm:inline">•</span>
        <span className="text-amber-400/80 text-[10px] hidden sm:inline">
          PS09 Network Hunter Intelligence Platform
        </span>
      </div>

      <div className="flex items-center space-x-3 text-[10px] text-slate-400">
        <div className="group relative flex items-center space-x-1 cursor-help hover:text-slate-200 transition-colors font-mono">
          <Info className="w-3 h-3 text-amber-400/80" />
          <span className="underline decoration-dotted underline-offset-2">Governance Statement</span>
          <div className="absolute right-0 top-full mt-1.5 w-80 p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[10px] leading-relaxed shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <p className="font-semibold text-amber-300 mb-1">Data Governance Notice:</p>
            Production deployment requires authorized data, access controls, audit policies, security controls, and appropriate data governance.
          </div>
        </div>
      </div>
    </div>
  );
};
