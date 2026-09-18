import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  HelpCircle,
  Link2,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export const InvestigationAssistant: React.FC = () => {
  const {
    aiResponse,
    aiLoading,
    aiError,
    runAiQuery,
    selectEntity,
    selectRelationship,
    selectEvidence,
  } = useInvestigation();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [showAdditionalContext, setShowAdditionalContext] = useState<boolean>(false);

  const suggestedQueries = [
    'How are Marcus Vance and Julian Thorne connected?',
    'What happened between Marcus Vance and Julian Thorne from Jan to Mar 2026?',
    'What links Case 001 and Case 002?',
    'What transactions went through Account A-001?',
    'What proof supports the link between Marcus Vance and Julian Thorne?',
    'Who is David Vance?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    runAiQuery(inputQuery);
  };

  const handleSelectSuggested = (q: string) => {
    setInputQuery(q);
    runAiQuery(q);
  };

  const renderFindingBadge = (type: string) => {
    switch (type) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm">
            Verified Document
          </span>
        );
      case 'OBSERVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 shadow-sm">
            Direct Observation
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-sm">
            Review Needed
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 shadow-sm">
            Conflicting Statement
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 shadow-sm">
            Recorded Statement
          </span>
        );
    }
  };

  // Primary finding IDs for clear hierarchy
  const primaryEvidenceTargetIds = new Set(['EVD-005', 'EVD-002', 'EVD-003', 'EVD-015', 'EVD-017']);
  const primaryRelTargetIds = new Set(['REL-001', 'REL-002']);
  const primarySourceTargetIds = new Set(['SRC-011']);

  const allEvidenceIds = aiResponse?.evidence_ids || [];
  const allRelIds = aiResponse?.relationship_ids || [];
  const allSourceIds = Array.from(
    new Set(aiResponse?.findings.flatMap((f) => f.source_ids) || [])
  );
  const allEntityIds = aiResponse?.entity_ids || [];

  const primaryEvs = allEvidenceIds.filter((id) => primaryEvidenceTargetIds.has(id));
  const secondaryEvs = allEvidenceIds.filter((id) => !primaryEvidenceTargetIds.has(id));

  const primaryRels = allRelIds.filter((id) => primaryRelTargetIds.has(id));
  const secondaryRels = allRelIds.filter((id) => !primaryRelTargetIds.has(id));

  const primarySources = allSourceIds.filter((id) => primarySourceTargetIds.has(id));
  const secondarySources = allSourceIds.filter((id) => !primarySourceTargetIds.has(id));

  const displayPrimaryEvs = primaryEvs.length > 0 ? primaryEvs : allEvidenceIds.slice(0, 1);
  const displaySecondaryEvs = primaryEvs.length > 0 ? secondaryEvs : allEvidenceIds.slice(1);
  const displayPrimaryRels = primaryRels.length > 0 ? primaryRels : allRelIds.slice(0, 2);
  const displaySecondaryRels = primaryRels.length > 0 ? secondaryRels : allRelIds.slice(2);
  const displayPrimarySources = primarySources.length > 0 ? primarySources : allSourceIds.slice(0, 1);

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md space-y-5 select-none transition-colors shadow-sm">
      {/* 1. Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                AI Investigation Assistant
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold shadow-sm">
                Evidence Backed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Answers verified against original case records and documents
            </p>
          </div>
        </div>

        {/* Human Review Status */}
        {aiResponse?.requires_human_review ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>⚠ Review Needed</span>
          </div>
        ) : aiResponse ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-mono text-xs font-semibold shadow-sm">
            <span>Investigator Advisory</span>
          </div>
        ) : null}
      </div>

      {/* 2. Suggested Queries Shortcuts */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          Suggested Questions:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSelectSuggested(sq)}
              className="text-left px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 hover:border-cyan-300 dark:border-slate-800 dark:hover:border-cyan-500/40 text-slate-700 hover:text-cyan-800 dark:text-slate-300 dark:hover:text-cyan-300 text-xs font-medium transition-all shadow-sm"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Query Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-0.5">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any question about suspects, bank accounts, or case events..."
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl px-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-sans shadow-sm transition-all"
        />
        <button
          type="submit"
          disabled={aiLoading || !inputQuery.trim()}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition-all disabled:opacity-50 shadow-md font-mono"
        >
          <span>{aiLoading ? 'Searching...' : 'Ask Assistant'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 4. AI Error Alert */}
      {aiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-mono shadow-sm">
          {aiError}
        </div>
      )}

      {/* 5. Grounded Response Container */}
      {aiResponse && (
        <div className="bg-slate-50/60 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs shadow-sm">
          {/* Query Header */}
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center justify-between">
            <span className="truncate pr-2 font-medium">Question: &quot;{aiResponse.query}&quot;</span>
            <span className="text-cyan-700 dark:text-cyan-400 font-bold font-mono flex-shrink-0">
              {aiResponse.findings.length} Evidence-Backed Findings
            </span>
          </div>

          {/* Ambiguity Alert Card (e.g. David Vance) */}
          {aiResponse.findings.some((f) => f.finding_type === 'AMBIGUOUS') && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold font-mono text-xs text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Two People Match This Name</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/40">
                  ⚠ Investigator Choice Needed
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-sans">
                Multiple individuals share the name &quot;David Vance&quot;. Please choose which person you want to inspect:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-[11px]">
                <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 flex flex-col justify-between space-y-2 shadow-sm">
                  <div>
                    <div className="text-amber-800 dark:text-amber-300 font-bold">Person 1 (P-002)</div>
                    <div className="text-slate-900 dark:text-slate-200 font-bold">David Vance</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">Operations Manager at Meridian Logistics</div>
                  </div>
                  <button
                    onClick={() => selectEntity('P-002')}
                    className="w-full text-center px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 transition-colors font-bold shadow-sm"
                  >
                    Inspect Operations Manager (P-002)
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30 flex flex-col justify-between space-y-2 shadow-sm">
                  <div>
                    <div className="text-amber-800 dark:text-amber-300 font-bold">Person 2 (P-011)</div>
                    <div className="text-slate-900 dark:text-slate-200 font-bold">David Vance</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">Software Engineer (Boston, Unrelated)</div>
                  </div>
                  <button
                    onClick={() => selectEntity('P-011')}
                    className="w-full text-center px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 transition-colors font-bold shadow-sm"
                  >
                    Inspect Unrelated Engineer (P-011)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Summary Answer */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Summary Answer
            </h4>
            <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-line shadow-sm">
              {aiResponse.answer}
            </div>
          </div>

          {/* Section 2: Key Facts */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              2. Key Facts &amp; Findings
            </h4>
            <div className="space-y-2.5">
              {aiResponse.findings.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        #{idx + 1}
                      </span>
                      {renderFindingBadge(f.finding_type)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Confidence: {f.confidence_label}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-normal font-sans">
                    {f.statement}
                  </p>

                  {/* Interactive Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                    {f.evidence_ids.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => selectEvidence(eid)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 transition-colors shadow-sm font-semibold"
                        title="Click to view document & highlight on graph"
                      >
                        <FileCheck2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{eid}</span>
                      </button>
                    ))}

                    {f.relationship_ids.map((rid) => (
                      <button
                        key={rid}
                        onClick={() => selectRelationship(rid)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 transition-colors shadow-sm font-semibold"
                        title="Click to highlight connection on graph"
                      >
                        <Link2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <span>{rid}</span>
                      </button>
                    ))}

                    {f.source_ids.map((sid) => (
                      <span
                        key={sid}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                      >
                        <FileText className="w-2.5 h-2.5 text-slate-400" />
                        <span>{sid}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Key Proof & Documents */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="bg-emerald-50/70 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>3. Primary Proof &amp; Documents</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 uppercase font-semibold">
                  Core Evidence
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {displayPrimaryEvs.map((eid) => (
                  <button
                    key={eid}
                    onClick={() => selectEvidence(eid)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/90 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 font-mono text-[11px] font-bold transition-all shadow-sm"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{eid}</span>
                  </button>
                ))}

                {displayPrimarySources.map((sid) => (
                  <span
                    key={sid}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-semibold shadow-sm"
                  >
                    <FileText className="w-3 h-3 text-emerald-500" />
                    <span>{sid}</span>
                  </span>
                ))}

                {displayPrimaryRels.map((rid) => (
                  <button
                    key={rid}
                    onClick={() => selectRelationship(rid)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950/90 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-400 text-cyan-900 dark:text-cyan-200 font-mono text-[11px] font-bold transition-all shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{rid}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: More Supporting Evidence */}
            {(displaySecondaryEvs.length > 0 || displaySecondaryRels.length > 0 || allEntityIds.length > 0) && (
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    4. Additional Case Records
                  </div>
                  <button
                    onClick={() => setShowAdditionalContext(!showAdditionalContext)}
                    className="flex items-center space-x-1 text-xs font-mono text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 transition-colors font-semibold"
                  >
                    {showAdditionalContext ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {showAdditionalContext ? 'Hide extra records' : `Show all (${displaySecondaryEvs.length + displaySecondaryRels.length + allEntityIds.length} records)`}
                    </span>
                  </button>
                </div>

                {showAdditionalContext && (
                  <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {displaySecondaryEvs.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Evidence Documents:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySecondaryEvs.map((eid) => (
                            <button
                              key={eid}
                              onClick={() => selectEvidence(eid)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold hover:border-slate-300 shadow-sm"
                            >
                              {eid}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {displaySecondaryRels.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Connections:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySecondaryRels.map((rid) => (
                            <button
                              key={rid}
                              onClick={() => selectRelationship(rid)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold hover:border-slate-300 shadow-sm"
                            >
                              {rid}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {secondarySources.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">Official Source Files:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {secondarySources.map((sid) => (
                            <span
                              key={sid}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-medium"
                            >
                              {sid}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {allEntityIds.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5">People &amp; Accounts:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {allEntityIds.map((eid) => (
                            <button
                              key={eid}
                              onClick={() => selectEntity(eid)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold hover:border-slate-300 shadow-sm"
                            >
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              <span>{eid}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Notes & Limits */}
          {aiResponse.caveats && aiResponse.caveats.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-400 space-y-1 shadow-sm">
              <div className="font-bold text-slate-900 dark:text-slate-300 uppercase">5. Important Notes:</div>
              {aiResponse.caveats.map((c, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-[11px]">
                  <span className="text-amber-600 dark:text-amber-400">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section 6: Officer Note */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs font-mono text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm">
            <span className="font-bold text-slate-800 dark:text-slate-300">6. Investigator Advisory:</span>
            <span className="text-slate-700 dark:text-slate-300 font-sans text-xs">
              AI findings are provided for investigative support. Final case decisions remain with the lead officer.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
