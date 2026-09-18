# Evidence RAG Architecture

**Platform:** Network Hunter (PS09 — "The Network Hunter")  
**Module:** Evidence Retrieval-Augmented Generation (RAG) Layer

---

## 1. Architectural Overview

The Evidence RAG layer provides deterministic, evidence-first semantic retrieval over investigation records. Crucially, it enforces **strict provenance preservation**, guaranteeing that every retrieved snippet can be cryptographically and relationally traced back to its underlying case and verified source.

```
┌────────────────────────────────────────────────────────┐
│                   Relational Database                  │
│   (Cases, Entities, Relationships, Sources, Evidence)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Evidence Document Builder                │
│   Deterministic text enrichment + Provenance Metadata  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Document Chunker                      │
│      Chunk-level provenance metadata preservation      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Embedding Provider                     │
│    API Model (OpenAI) / Deterministic Dev Fallback     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Vector Store                        │
│   PostgreSQL + pgvector (Target) / SQLite (Fallback)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│         Filtered Similarity Retrieval API              │
│    (Case ID, Entity ID, Source Type, Date Range)       │
└────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Pipeline Steps

### Step A: Evidence → Document
Every verified or observed `Evidence` record is transformed into an enriched, deterministic document:
- **Header**: Evidence ID, Title, Case ID, Case Number, Date, Verification Status.
- **Source Context**: Source ID, Source Type, Reference Code, Source Title.
- **Entity Context**: Names, IDs, and types of all involved individuals, organizations, accounts, vehicles, locations, or devices.
- **Relational Context**: Active relationships linked to this evidence/source.
- **Content**: Verbatim evidentiary observations.

### Step B: Chunking
- If evidence is concise (default < 1500 characters), it remains a single chunk.
- Long investigative reports are cleanly split with character overlap.
- **Key Guarantee:** Every chunk retains `evidence_id`, `source_id`, `case_id`, `chunk_id`, `chunk_index`, and metadata.

### Step C: Embeddings
- **Production / Configured:** API-based model (e.g., `text-embedding-3-small`) configured via `EMBEDDING_API_KEY` and `EMBEDDING_MODEL`.
- **Development / Test Fallback:** Multi-ngram semantic feature projection with L2 normalization for deterministic cosine similarity during local development and offline CI.

### Step D: Vector Storage & Storage Abstraction
- Stored in the `vector_embeddings` table.
- **Production Target:** PostgreSQL with `pgvector` HNSW/IVFFlat indexes.
- **Development Fallback:** SQLite with JSON-serialized vectors and in-memory cosine ranking.

### Step E: Retrieval with Metadata Filtering
Retrieval supports multi-attribute pre-filtering:
- `case_id`: Strict case isolation (e.g. searching CASE-001 never leaks CASE-002 records).
- `entity_id`: Filter evidence mentioning specific suspect/entity.
- `source_type`: Filter by source (e.g. `FINANCIAL_RECORD`, `CDR`, `SURVEILLANCE`).
- `verification_status`: Filter by status (e.g. `VERIFIED`, `OBSERVED`).
- `date_from` / `date_to`: Temporal range bounds.

---

## 3. Provenance Chain

Every vector retrieval hit guarantees the following chain:

```
Vector Retrieval Hit (chunk_id)
  └── Document (document_id)
        └── Evidence (evidence_id)
              └── Source (source_id, reference_code, source_type)
                    └── Case (case_id, case_number, title)
```

This ensures the future Graph-RAG context fusion layer and LLM generation layer can cite exact evidence records and source documents rather than making ungrounded claims.

---

## 4. API Reference

### 1. Index All Evidence
- **Endpoint:** `POST /api/v1/rag/index`
- **Response:**
  ```json
  {
    "status": "completed",
    "evidence_processed": 25,
    "documents_created": 25,
    "chunks_created": 25,
    "embeddings_created": 25
  }
  ```

### 2. Semantic Search
- **Endpoint:** `POST /api/v1/rag/search`
- **Request:**
  ```json
  {
    "query": "What evidence connects Marcus Vance and Julian Thorne?",
    "case_id": "CASE-001",
    "top_k": 3,
    "source_type": "FINANCIAL_RECORD"
  }
  ```
- **Response:**
  ```json
  {
    "query": "What evidence connects Marcus Vance and Julian Thorne?",
    "case_id": "CASE-001",
    "total_results": 1,
    "results": [
      {
        "evidence_id": "EVD-005",
        "source_id": "SRC-011",
        "case_id": "CASE-001",
        "document_id": "DOC-EVD-005",
        "chunk_id": "CHUNK-EVD-005-0",
        "text": "Evidence Record: EVD-005 - Chase Signature Mandate for Account A-001...",
        "score": 0.892,
        "metadata": {
          "evidence_type": "BANK_MANDATE",
          "source_type": "FINANCIAL_RECORD",
          "verification_status": "VERIFIED",
          "data_origin": "SYNTHETIC",
          "demo_only": true
        }
      }
    ]
  }
  ```

### 3. RAG Pipeline Statistics
- **Endpoint:** `GET /api/v1/rag/stats`
- **Response:**
  ```json
  {
    "documents": 25,
    "chunks": 25,
    "embeddings": 25,
    "cases_indexed": 2
  }
  ```
