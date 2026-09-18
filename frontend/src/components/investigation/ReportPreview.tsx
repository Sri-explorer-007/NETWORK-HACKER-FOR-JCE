import React from 'react';
import {
  FileText,
  X,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const ReportPreview: React.FC = () => {
  const { reportModalOpen, setReportModalOpen, activeCase, aiResponse } =
    useInvestigation();

  if (!reportModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Action Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider">
                EXECUTIVE INVESTIGATION BRIEFING DRAFT
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Case: {activeCase?.id || 'CASE-001'} • {activeCase?.case_number || 'NH-2026-001'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRINT DRAFT</span>
            </button>
            <button
              onClick={() => setReportModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 font-sans leading-relaxed">
          {/* Classification & Human Review Watermark */}
          <div className="border-2 border-dashed border-amber-500/40 bg-amber-950/20 p-3.5 rounded-xl text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 font-mono font-extrabold text-amber-300 tracking-widest uppercase">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>DRAFT — HUMAN REVIEW REQUIRED</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              CONFIDENTIAL INTELLIGENCE BRIEFING • ADVISORY DECISION-SUPPORT
            </p>
          </div>

          {/* 1. CASE */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              1. CASE SUMMARY
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500">Case Title:</span>
                <div className="text-white font-bold">{activeCase?.title}</div>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <div className="text-emerald-400 font-bold">{activeCase?.status}</div>
              </div>
              <div>
                <span className="text-slate-500">Priority:</span>
                <div className="text-rose-400 font-bold">{activeCase?.priority}</div>
              </div>
              <div>
                <span className="text-slate-500">Case Code:</span>
                <div className="text-slate-200">{activeCase?.case_number}</div>
              </div>
            </div>
          </section>

          {/* 2. KEY ENTITIES */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              2. KEY ENTITIES OF INTEREST
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">P-001: Marcus Vance</span>
                <div className="text-slate-400">Primary Person of Interest</div>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">A-001: Chase Account</span>
                <div className="text-slate-400">Shared Conduit Account</div>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">P-004: Julian Thorne</span>
                <div className="text-slate-400">Cross-Case Bridge Entity</div>
              </div>
            </div>
          </section>

          {/* 3. KEY RELATIONSHIPS */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              3. KEY RECORDED RELATIONSHIPS
            </h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              Knowledge Graph multi-hop analysis documents an associative connection between{' '}
              <strong className="text-cyan-300">Marcus Vance (P-001)</strong> and{' '}
              <strong className="text-cyan-300">Julian Thorne (P-004)</strong> through{' '}
              <strong className="text-emerald-300">Chase Manhattan Account A-001</strong>. This relationship is documented by verified signature mandate form{' '}
              <strong className="text-emerald-300">EVD-005</strong> (Source: <strong className="text-slate-200">SRC-011</strong>).
            </p>
          </section>

          {/* 4. TIMELINE */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              4. CHRONOLOGICAL TIMELINE
            </h3>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>[2026-01-10 14:22] EVT-002: Intercepted Communication (P-001 → P-004)</span>
                <span className="text-slate-500">Source: SRC-002</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>[2026-01-15 19:45] EVT-004: Observed Meeting at Warehouse Dock 9 (L-001)</span>
                <span className="text-slate-500">Source: SRC-004</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span>[2026-01-20 11:30] EVT-006: $250,000 Conduit Wire Transfer via Account A-001</span>
                <span className="text-slate-500">Source: SRC-005</span>
              </div>
            </div>
          </section>

          {/* 5. SUPPORTING RECORDS */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              5. PRIMARY SUPPORTING RECORDS
            </h3>
            <div className="flex flex-wrap gap-2 font-mono text-[10px]">
              <span className="px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300">
                EVD-005: Account A-001 Signature Mandate Form (Verified record)
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300">
                EVD-003: Surveillance Logs Dock 9 (Observed record)
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                SRC-011: Financial Intelligence Unit Disclosure
              </span>
            </div>
          </section>

          {/* 6. POTENTIAL PATTERNS */}
          <section className="space-y-1.5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              6. POTENTIAL PATTERNS DETECTED
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">Potential Pattern: SHARED ACCOUNT</span>
                <div className="text-slate-400">P-001 ↔ A-001 ↔ P-004 (Requires review)</div>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-purple-400 font-bold">Potential Pattern: CROSS-CASE LINK</span>
                <div className="text-slate-400">Julian Thorne (CASE-001 ↕ CASE-002)</div>
              </div>
            </div>
          </section>

          {/* 7. AI-ASSISTED SUMMARY */}
          {aiResponse && (
            <section className="space-y-1.5">
              <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                7. AI-ASSISTED ANALYTICAL SYNTHESIS (ADVISORY)
              </h3>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-sans text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                {aiResponse.answer}
              </div>
            </section>
          )}

          {/* 8. CAVEATS & GOVERNANCE */}
          <section className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 space-y-1">
            <div className="font-bold text-slate-400">8. INVESTIGATIVE CAVEATS &amp; GOVERNANCE:</div>
            <div>• Verification status describes record status, not a legal conclusion.</div>
            <div>• AI assistance is advisory. Final investigative decisions remain with authorized human investigators.</div>
            <div className="pt-2 flex items-center justify-between text-slate-400">
              <span>Authorized Investigator Sign-off: ________________________</span>
              <span>Date: ________________</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
