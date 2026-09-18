import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  HelpCircle,
  Database,
  Link2,
  AlertTriangle,
  ArrowRight,
  X,
  Eye,
  Layers,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const EvidencePanel: React.FC = () => {
  const {
    selectedRelationshipId,
    relationshipEvidence,
    selectRelationship,
    selectedEvidenceId,
    activeCaseId,
  } = useInvestigation();

  if (!selectedRelationshipId || !relationshipEvidence) {
    return (
      <div className="hidden lg:flex w-72 xl:w-80 2xl:w-96 bg-white dark:bg-slate-900/70 border-l border-slate-200 dark:border-slate-800/80 flex-col items-center justify-center p-6 text-center text-slate-500 backdrop-blur-md select-none transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
          <Link2 className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 mb-1 font-mono uppercase tracking-wider">
          Evidence Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xs">
          Click any connection on the graph or an evidence badge to inspect original documents, verification status, and chain of custody.
        </p>
      </div>
    );
  }

  const rel = relationshipEvidence.relationship;
  const source = relationshipEvidence.source;
  const evidenceList = relationshipEvidence.evidence_items || [];
  const provenance = relationshipEvidence.provenance_chain || [];

  const activeEvidence = evidenceList.find((e) => e.id === selectedEvidenceId) || evidenceList[0];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span
            title="Verified against official records and documents."
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold cursor-help shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Document</span>
          </span>
        );
      case 'OBSERVED':
        return (
          <span
            title="Directly observed during surveillance or logging."
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono text-[10px] font-bold cursor-help shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Direct Observation</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span
            title="Multiple possible matching records detected."
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold cursor-help shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Review Needed</span>
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span
            title="Conflicts with other verified evidence on file."
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 font-mono text-[10px] font-bold animate-pulse cursor-help shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Conflicting Statement</span>
          </span>
        );
      default:
        return (
          <span
            title="Recorded statement pending document verification."
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 font-mono text-[10px] cursor-help shadow-sm"
          >
            <span>Recorded Statement</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full sm:w-80 md:w-88 xl:w-96 bg-white dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800/80 flex flex-col h-full flex-shrink-0 backdrop-blur-md overflow-y-auto select-none transition-colors shadow-sm">
      {/* 1. Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Evidence Details
          </span>
        </div>
        <button
          onClick={() => selectRelationship(null)}
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* 1. Relationship Target Block */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="font-bold">1. CASE CONNECTION</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/30">
              {rel.id}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{rel.from_entity_id}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Source</div>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 mb-0.5">
                {rel.relationship_type.replace(/_/g, ' ')}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-right font-mono">
              <div className="text-xs font-bold text-slate-900 dark:text-white">{rel.to_entity_id}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Target</div>
            </div>
          </div>

          {/* 2. Verification Status */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Verification Status:</span>
            {renderStatusBadge(rel.status)}
          </div>

          {rel.description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800 font-sans">
              {rel.description}
            </p>
          )}
        </div>

        {/* 2. Evidence Document Block */}
        {activeEvidence && (
          <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1 font-bold">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>2. SUPPORTING DOCUMENT</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/30">
                {activeEvidence.id}
              </span>
            </div>

            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{activeEvidence.title}</div>
            
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600 dark:text-slate-400">Type: {activeEvidence.evidence_type}</span>
              {renderStatusBadge(activeEvidence.verification_status)}
            </div>

            {/* Contradiction Alert */}
            {activeEvidence.verification_status === 'CONTRADICTED' && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/50 text-rose-900 dark:text-rose-200 text-xs flex items-start space-x-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Conflicting Statement:</span> This statement conflicts with other verified evidence on file.
                </div>
              </div>
            )}

            {/* Ambiguity Alert */}
            {activeEvidence.verification_status === 'AMBIGUOUS' && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2 shadow-sm">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Name Match Alert:</span> Multiple individuals match this record. Investigator review required.
                </div>
              </div>
            )}

            {/* Evidence Text Box */}
            <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-mono shadow-sm">
              {activeEvidence.content}
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>Date: {activeEvidence.evidence_date?.substring(0, 10)}</span>
              <span className="text-slate-400">Official Case Record</span>
            </div>
          </div>
        )}

        {/* 3. Source Metadata Block */}
        {source ? (
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1 font-bold">
                <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>3. SOURCE FILE</span>
              </span>
              <span className="text-cyan-700 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/30">
                {source.id}
              </span>
            </div>

            <div className="font-bold text-slate-900 dark:text-white text-xs">{source.title}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-slate-400">Ref Code:</span>{' '}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{source.reference_code}</span>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>{' '}
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{source.source_type}</span>
              </div>
              <div>
                <span className="text-slate-400">Date:</span>{' '}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{source.source_date}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{source.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 text-slate-500 text-xs italic">
            3. No external source file linked directly.
          </div>
        )}

        {/* 4. Compact Visual Provenance Chain */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>4. CHAIN OF CUSTODY TRACE</span>
          </div>
          <div className="flex flex-col space-y-1.5 text-xs font-mono bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {provenance.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-slate-800 dark:text-slate-300">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{idx + 1}.</span>
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Case Reference */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 shadow-sm">
          <span className="font-semibold">Case ID:</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-bold">{activeCaseId}</span>
        </div>
      </div>
    </div>
  );
};
