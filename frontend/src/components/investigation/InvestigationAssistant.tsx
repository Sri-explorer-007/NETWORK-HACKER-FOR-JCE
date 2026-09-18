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
    'What connects Marcus Vance and Julian Thorne?',
    'What happened between Marcus Vance and Julian Thorne between January and March 2026?',
    'What connects CASE-001 and CASE-002?',
    'What relationships involve account A-001?',
    'What evidence supports the connection between Marcus Vance and Julian Thorne?',
    'Show David Vance',
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
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            VERIFIED RECORD
          </span>
        );
      case 'OBSERVED':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            OBSERVED RECORD
          </span>
        );
      case 'AMBIGUOUS':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
            AMBIGUOUS RECORD
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
            CONTRADICTED RECORD
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-400">
            RECORDED STATEMENT
          </span>
        );
    }
  };

  // Primary finding IDs requested for clear investigative proof hierarchy
  const primaryEvidenceTargetIds = new Set(['EVD-005', 'EVD-002', 'EVD-003', 'EVD-015', 'EVD-017']);
  const primaryRelTargetIds = new Set(['REL-001', 'REL-002']);
  const primarySourceTargetIds = new Set(['SRC-011']);

  const allEvidenceIds = aiResponse?.evidence_ids || [];
  const allRelIds = aiResponse?.relationship_ids || [];
  const allSourceIds = Array.from(
    new Set(aiResponse?.findings.flatMap((f) => f.source_ids) || [])
  );
  const allEntityIds = aiResponse?.entity_ids || [];

  // Categorize Primary vs Secondary
  const primaryEvs = allEvidenceIds.filter((id) => primaryEvidenceTargetIds.has(id));
  const secondaryEvs = allEvidenceIds.filter((id) => !primaryEvidenceTargetIds.has(id));

  const primaryRels = allRelIds.filter((id) => primaryRelTargetIds.has(id));
  const secondaryRels = allRelIds.filter((id) => !primaryRelTargetIds.has(id));

  const primarySources = allSourceIds.filter((id) => primarySourceTargetIds.has(id));
  const secondarySources = allSourceIds.filter((id) => !primarySourceTargetIds.has(id));

  // Fallback elevators if specific targets not present
  const displayPrimaryEvs = primaryEvs.length > 0 ? primaryEvs : allEvidenceIds.slice(0, 1);
  const displaySecondaryEvs = primaryEvs.length > 0 ? secondaryEvs : allEvidenceIds.slice(1);
  const displayPrimaryRels = primaryRels.length > 0 ? primaryRels : allRelIds.slice(0, 2);
  const displaySecondaryRels = primaryRels.length > 0 ? secondaryRels : allRelIds.slice(2);
  const displayPrimarySources = primarySources.length > 0 ? primarySources : allSourceIds.slice(0, 1);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4 select-none">
      {/* 1. Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                AI INVESTIGATION ASSISTANT
              </h3>
              {aiResponse?.mode === 'DEMO_FALLBACK' ? (
                <span className="text-[9px] px-2 py-0.2 rounded font-mono bg-slate-950 border border-cyan-500/40 text-cyan-300 font-semibold">
                  GRAPH-RAG GROUNDED • DEMO FALLBACK
                </span>
              ) : (
                <span className="text-[9px] px-2 py-0.2 rounded font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                  GRAPH-RAG GROUNDED
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Grounded in retrieved investigation records
            </p>
          </div>
        </div>

        {/* Human Review Status */}
        {aiResponse?.requires_human_review ? (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>⚠ HUMAN REVIEW REQUIRED</span>
          </div>
        ) : aiResponse ? (
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px]">
            <span>HUMAN REVIEW ADVISORY</span>
          </div>
        ) : null}
      </div>

      {/* 2. Suggested Queries Shortcuts */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
          SUGGESTED INVESTIGATION QUERIES:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSelectSuggested(sq)}
              className="text-left px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Query Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask an investigative question about entities, timelines, or accounts..."
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
        />
        <button
          type="submit"
          disabled={aiLoading || !inputQuery.trim()}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 shadow-md shadow-cyan-500/20 font-mono"
        >
          <span>{aiLoading ? 'ANALYZING...' : 'RUN QUERY'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 4. AI Error Alert */}
      {aiError && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {aiError}
        </div>
      )}

      {/* 5. Grounded Response Container */}
      {aiResponse && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
          {/* Query Echo */}
          <div className="text-[11px] font-mono text-slate-400 border-b border-slate-850 pb-2 flex items-center justify-between">
            <span>Query: &quot;{aiResponse.query}&quot;</span>
            <span className="text-cyan-400 font-bold font-mono">
              {aiResponse.findings.length} Grounded Finding(s)
            </span>
          </div>

          {/* Ambiguity Alert Card (e.g. David Vance) */}
          {aiResponse.findings.some((f) => f.finding_type === 'AMBIGUOUS') && (
            <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold font-mono text-xs text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>AMBIGUOUS ENTITY DETECTED</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                  ⚠ HUMAN REVIEW REQUIRED
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-200">
                Multiple candidate entities match this name. No automatic selection was made.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/30 flex flex-col justify-between space-y-1.5">
                  <div>
                    <div className="text-amber-300 font-bold">Candidate 1: P-002</div>
                    <div className="text-slate-200 font-semibold">David Vance</div>
                    <div className="text-slate-400 text-[9px]">Associate / Logistics Facilitator</div>
                  </div>
                  <button
                    onClick={() => selectEntity('P-002')}
                    className="w-full text-center px-2 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors mt-1 font-semibold"
                  >
                    Inspect Candidate P-002
                  </button>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/30 flex flex-col justify-between space-y-1.5">
                  <div>
                    <div className="text-amber-300 font-bold">Candidate 2: P-011</div>
                    <div className="text-slate-200 font-semibold">David Vance</div>
                    <div className="text-slate-400 text-[9px]">Systems Engineer (Unrelated Entity)</div>
                  </div>
                  <button
                    onClick={() => selectEntity('P-011')}
                    className="w-full text-center px-2 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition-colors mt-1 font-semibold"
                  >
                    Inspect Candidate P-011
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: ANSWER */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              1. ANSWER (GROUNDED INVESTIGATIVE SUMMARY)
            </h4>
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans whitespace-pre-line">
              {aiResponse.answer}
            </div>
          </div>

          {/* Section 2: KEY FINDINGS */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              2. KEY FINDINGS
            </h4>
            <div className="space-y-2">
              {aiResponse.findings.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        #{idx + 1}
                      </span>
                      {renderFindingBadge(f.finding_type)}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      Confidence: {f.confidence_label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200 leading-normal">{f.statement}</p>

                  {/* Interactive IDs inside Finding */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[9px]">
                    {f.evidence_ids.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => selectEvidence(eid)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-colors"
                        title="Click to view evidence & highlight graph edge"
                      >
                        <FileCheck2 className="w-2.5 h-2.5" />
                        <span>{eid}</span>
                      </button>
                    ))}

                    {f.relationship_ids.map((rid) => (
                      <button
                        key={rid}
                        onClick={() => selectRelationship(rid)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition-colors"
                        title="Click to highlight graph relationship"
                      >
                        <Link2 className="w-2.5 h-2.5" />
                        <span>{rid}</span>
                      </button>
                    ))}

                    {f.source_ids.map((sid) => (
                      <span
                        key={sid}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {sid}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: PRIMARY SUPPORTING RECORDS & SOURCES */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            {/* Primary Finding Card */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>3. PRIMARY SUPPORTING RECORDS</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400/80 uppercase">
                  Verified Core Nexus
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {displayPrimaryEvs.map((eid) => (
                  <button
                    key={eid}
                    onClick={() => selectEvidence(eid)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400 text-emerald-200 font-mono text-[10px] font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-950/50"
                  >
                    <FileCheck2 className="w-3 h-3 text-emerald-400" />
                    <span>{eid}</span>
                  </button>
                ))}

                {displayPrimarySources.map((sid) => (
                  <span
                    key={sid}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-semibold"
                  >
                    <span>{sid}</span>
                  </span>
                ))}

                {displayPrimaryRels.map((rid) => (
                  <button
                    key={rid}
                    onClick={() => selectRelationship(rid)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] font-bold hover:bg-cyan-900 transition-all shadow-md shadow-cyan-950/50"
                  >
                    <Link2 className="w-3 h-3 text-cyan-400" />
                    <span>{rid}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: ADDITIONAL RETRIEVED CONTEXT */}
            {(displaySecondaryEvs.length > 0 || displaySecondaryRels.length > 0 || allEntityIds.length > 0) && (
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    4. ADDITIONAL RETRIEVED CONTEXT
                  </div>
                  <button
                    onClick={() => setShowAdditionalContext(!showAdditionalContext)}
                    className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAdditionalContext ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {showAdditionalContext ? 'Hide Context' : `Show (${displaySecondaryEvs.length + displaySecondaryRels.length + allEntityIds.length} Supporting Records)`}
                    </span>
                  </button>
                </div>

                {showAdditionalContext && (
                  <div className="space-y-2 pt-1">
                    {displaySecondaryEvs.length > 0 && (
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 mb-1">SUPPORTING EVIDENCE:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySecondaryEvs.map((eid) => (
                            <button
                              key={eid}
                              onClick={() => selectEvidence(eid)}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[9px] hover:border-slate-700"
                            >
                              {eid}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {displaySecondaryRels.length > 0 && (
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 mb-1">SUPPORTING RELATIONSHIPS:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySecondaryRels.map((rid) => (
                            <button
                              key={rid}
                              onClick={() => selectRelationship(rid)}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[9px] hover:border-slate-700"
                            >
                              {rid}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {secondarySources.length > 0 && (
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 mb-1">SUPPORTING SOURCES:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {secondarySources.map((sid) => (
                            <span
                              key={sid}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px]"
                            >
                              {sid}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {allEntityIds.length > 0 && (
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 mb-1">ENTITIES INVOLVED:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {allEntityIds.map((eid) => (
                            <button
                              key={eid}
                              onClick={() => selectEntity(eid)}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[9px] hover:border-slate-700"
                            >
                              {eid}
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

          {/* Section 5: CAVEATS */}
          {aiResponse.caveats && aiResponse.caveats.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 uppercase">5. INVESTIGATIVE CAVEATS:</div>
              {aiResponse.caveats.map((c, i) => (
                <div key={i} className="flex items-center space-x-1">
                  <span className="text-amber-400">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section 6: HUMAN REVIEW GOVERNANCE ADVISORY */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>6. HUMAN REVIEW:</span>
            <span className="text-slate-300">
              AI assistance is advisory. Final investigative decisions remain with authorized investigators.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
