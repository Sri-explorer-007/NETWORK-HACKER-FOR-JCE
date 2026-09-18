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
      <div className="w-80 bg-slate-900/70 border-l border-slate-800/80 flex flex-col items-center justify-center p-6 text-center text-slate-500 backdrop-blur-md select-none">
        <Link2 className="w-8 h-8 text-slate-700 mb-3" />
        <h3 className="text-xs font-semibold text-slate-400 mb-1">Evidence Provenance Inspector</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Click any relationship edge on the graph or an evidence ID to inspect source documents, verification status, and provenance traces.
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
            title="Verification status describes the status of the record, not a legal conclusion."
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold cursor-help"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Verified record</span>
          </span>
        );
      case 'OBSERVED':
        return (
          <span
            title="Verification status describes the status of the record, not a legal conclusion."
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold cursor-help"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Observed record</span>
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span
            title="Verification status describes the status of the record, not a legal conclusion."
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold cursor-help"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>Ambiguous record</span>
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span
            title="Verification status describes the status of the record, not a legal conclusion."
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold animate-pulse cursor-help"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Contradicted record</span>
          </span>
        );
      default:
        return (
          <span
            title="Verification status describes the status of the record, not a legal conclusion."
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] cursor-help"
          >
            <span>Unverified record</span>
          </span>
        );
    }
  };

  return (
    <div className="w-96 bg-slate-900/80 border-l border-slate-800/80 flex flex-col h-full flex-shrink-0 backdrop-blur-md overflow-y-auto select-none">
      {/* 1. Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            EVIDENCE &amp; PROVENANCE
          </span>
        </div>
        <button
          onClick={() => selectRelationship(null)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3.5 text-xs">
        {/* 1. Relationship Target Block */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>1. RELATIONSHIP</span>
            <span className="text-cyan-400 font-bold">{rel.id}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-left font-mono">
              <div className="text-[11px] font-bold text-white">{rel.from_entity_id}</div>
              <div className="text-[9px] text-slate-400">Origin Entity</div>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] font-mono font-bold text-cyan-400 mb-0.5">
                {rel.relationship_type.replace(/_/g, ' ')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-right font-mono">
              <div className="text-[11px] font-bold text-white">{rel.to_entity_id}</div>
              <div className="text-[9px] text-slate-400">Target Entity</div>
            </div>
          </div>

          {/* 2. Verification Status */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-400">Verification Status:</span>
            {renderStatusBadge(rel.status)}
          </div>

          <p className="text-[9px] text-slate-500 font-mono italic">
            Verification status describes record status, not a legal conclusion.
          </p>

          {rel.description && (
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-850">
              {rel.description}
            </p>
          )}
        </div>

        {/* 3. Evidence Document Block */}
        {activeEvidence && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center space-x-1">
                <FileCheck2 className="w-3 h-3 text-emerald-400" />
                <span>3. SUPPORTING EVIDENCE</span>
              </span>
              <span className="text-emerald-400 font-bold">{activeEvidence.id}</span>
            </div>

            <div className="font-semibold text-white text-xs">{activeEvidence.title}</div>
            
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Type: {activeEvidence.evidence_type}</span>
              {renderStatusBadge(activeEvidence.verification_status)}
            </div>

            {/* Contradiction Alert */}
            {activeEvidence.verification_status === 'CONTRADICTED' && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-[11px] flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Contradicted Record:</span> This record conflicts with other retrieved evidence and should not be treated as established fact.
                </div>
              </div>
            )}

            {/* Ambiguity Alert */}
            {activeEvidence.verification_status === 'AMBIGUOUS' && (
              <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-200 text-[11px] flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Ambiguous Attribute:</span> Multi-party or duplicate identity collision detected. Human investigator review required.
                </div>
              </div>
            )}

            {/* Evidence Raw Text */}
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-mono">
              {activeEvidence.content}
            </div>

            <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1">
              <span>Recorded Date: {activeEvidence.evidence_date?.substring(0, 10)}</span>
              <span className="text-slate-500">SYNTHETIC DATA</span>
            </div>
          </div>
        )}

        {/* 4. Source Metadata Block */}
        {source ? (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>4. SOURCE DOCUMENT</span>
              </span>
              <span className="text-cyan-400 font-bold">{source.id}</span>
            </div>

            <div className="font-semibold text-white text-xs">{source.title}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400">
              <div>
                <span className="text-slate-400">Ref Code:</span>{' '}
                <span className="text-slate-200">{source.reference_code}</span>
              </div>
              <div>
                <span className="text-slate-400">Type:</span>{' '}
                <span className="text-cyan-400">{source.source_type}</span>
              </div>
              <div>
                <span className="text-slate-400">Date:</span>{' '}
                <span className="text-slate-200">{source.source_date}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <span className="text-emerald-400">{source.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-slate-500 text-[11px] italic">
            4. No external source document linked directly.
          </div>
        )}

        {/* 5. Compact Visual Provenance Chain */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            5. PROVENANCE TRACE
          </div>
          <div className="flex flex-col space-y-1 text-[10px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
            {provenance.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-slate-300">
                <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Case Reference */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>6. CASE FILE:</span>
          <span className="text-cyan-400 font-bold">{activeCaseId}</span>
        </div>
      </div>
    </div>
  );
};
