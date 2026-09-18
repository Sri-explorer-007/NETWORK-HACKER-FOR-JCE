from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from app.rag.document import EvidenceDocument
from app.rag.config import rag_config


@dataclass
class EvidenceChunk:
    """Individual chunk ready for vector embedding and storage."""
    chunk_id: str
    document_id: str
    evidence_id: str
    case_id: Optional[str]
    source_id: str
    chunk_index: int
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)


def chunk_document(doc: EvidenceDocument, max_chunk_chars: Optional[int] = None, overlap_chars: Optional[int] = None) -> List[EvidenceChunk]:
    """Splits an EvidenceDocument into one or more chunks while preserving all provenance metadata."""
    max_chars = max_chunk_chars or rag_config.MAX_CHUNK_CHARS
    overlap = overlap_chars or rag_config.CHUNK_OVERLAP_CHARS
    
    raw_text = doc.text.strip()
    
    # If document is within max size, preserve as a single chunk
    if len(raw_text) <= max_chars:
        chunk_id = f"CHUNK-{doc.evidence_id}-0"
        chunk_meta = dict(doc.metadata)
        chunk_meta.update({
            "chunk_id": chunk_id,
            "chunk_index": 0,
            "total_chunks": 1,
        })
        return [
            EvidenceChunk(
                chunk_id=chunk_id,
                document_id=doc.document_id,
                evidence_id=doc.evidence_id,
                case_id=doc.case_id,
                source_id=doc.source_id,
                chunk_index=0,
                text=raw_text,
                metadata=chunk_meta,
            )
        ]

    # Split text with overlap
    chunks = []
    start = 0
    chunk_idx = 0
    
    while start < len(raw_text):
        end = min(start + max_chars, len(raw_text))
        
        # If not at the end of text, attempt to break at a newline or period for clean boundaries
        if end < len(raw_text):
            break_point = raw_text.rfind("\n", start, end)
            if break_point == -1 or break_point <= start:
                break_point = raw_text.rfind(". ", start, end)
                if break_point != -1 and break_point > start:
                    end = break_point + 1
            else:
                end = break_point

        chunk_text = raw_text[start:end].strip()
        if chunk_text:
            chunk_id = f"CHUNK-{doc.evidence_id}-{chunk_idx}"
            chunk_meta = dict(doc.metadata)
            chunk_meta.update({
                "chunk_id": chunk_id,
                "chunk_index": chunk_idx,
            })
            
            chunks.append(
                EvidenceChunk(
                    chunk_id=chunk_id,
                    document_id=doc.document_id,
                    evidence_id=doc.evidence_id,
                    case_id=doc.case_id,
                    source_id=doc.source_id,
                    chunk_index=chunk_idx,
                    text=chunk_text,
                    metadata=chunk_meta,
                )
            )
            chunk_idx += 1

        if end >= len(raw_text):
            break
        start = max(end - overlap, start + 1)

    # Update total_chunks count on metadata
    for c in chunks:
        c.metadata["total_chunks"] = len(chunks)

    return chunks
