# Network Hunter

**Evidence-first, time-aware network intelligence platform** (PS09 "The Network Hunter").

---

## Project Structure

```
network-hunter/
│
├── frontend/             # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # View / route pages
│   │   ├── services/     # API integration & network calls
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript interfaces & models
│   │   ├── data/         # Mock / static data
│   │   ├── App.tsx       # Main application component
│   │   ├── main.tsx      # App entrypoint
│   │   └── index.css     # Global styles & Tailwind directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/              # Python + FastAPI + Pydantic + SQLAlchemy + NetworkX
│   ├── app/
│   │   ├── main.py       # FastAPI application entrypoint
│   │   ├── api/          # API routers and endpoints
│   │   │   └── v1/endpoints/ # health, cases, entities, relationships, rag, investigation, graph
│   │   ├── models/       # Database models (Case, Entity, Relationship, Event, Source, Evidence, VectorEmbedding)
│   │   ├── schemas/      # Request/response schemas (Pydantic)
│   │   ├── services/     # Business logic
│   │   ├── graph/        # NetworkX Graph Builder, Entity Resolver, & Graph Retriever
│   │   ├── rag/          # Evidence RAG, Context Builder, LLM Context Formatter, & Hybrid Retriever
│   │   ├── llm/          # Grounded LLM Service, Configurable Provider, Prompts, & Guardrails
│   │   ├── db/           # Database connections, session, & seeding
│   │   └── core/         # Settings & core configurations
│   ├── tests/            # Automated test suite (pytest - 51 tests)
│   │   ├── test_health.py
│   │   ├── test_investigation_data.py
│   │   ├── test_rag.py
│   │   ├── test_graph_rag.py
│   │   └── test_llm_grounding.py
│   ├── requirements.txt
│   └── .env.example
│
├── data/
│   ├── raw/              # Raw ingested datasets
│   ├── processed/        # Preprocessed & normalized data
│   └── evidence/         # Extracted evidence artifacts
│
├── docs/
│   ├── rag-architecture.md # Evidence RAG architecture guide
│   ├── graph-rag.md        # Graph-RAG & Context Fusion guide
│   └── llm-grounding.md    # Grounded LLM Investigation Assistant guide
│
├── scripts/
│   ├── seed_database.py       # Seed synthetic demonstration dataset
│   ├── index_rag.py           # Index evidence into vector database
│   ├── verify_step2_api.py    # Step 2 verification
│   ├── verify_step3_rag.py    # Step 3 verification
│   ├── verify_step4_graph_rag.py # Step 4 verification
│   └── verify_step5_llm.py    # Step 5 Grounded LLM verification
│
├── README.md
└── .gitignore
```

---

## Getting Started

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

5. **Populate Demonstration Dataset**:
   ```bash
   python ../scripts/seed_database.py
   ```

6. **Index Evidence Vector Database**:
   ```bash
   python ../scripts/index_rag.py
   ```

7. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

8. **Verify the health check**:
   - URL: [http://localhost:8000/health](http://localhost:8000/health)
   - Response: `{"status": "ok", "service": "network-hunter-api"}`

---

## Grounded LLM Investigation Architecture

Network Hunter uses a **Graph-RAG retrieval-first approach**:

- **Knowledge Graph**: WHAT connects entities (multi-hop paths, bridge accounts).
- **Timeline Engine**: WHEN events occurred chronologically.
- **Evidence Vector Store**: WHERE the source documents are located.
- **Grounded LLM**: EXPLAIN the retrieved evidence without hallucinations.

### Key Investigation Endpoints

- `POST /api/v1/investigation/query`: Full end-to-end grounded LLM query with structured findings, exact ID citations, and guardrails.
- `POST /api/v1/investigation/retrieve`: Multi-modal Graph-RAG context fusion payload.
- `GET /api/v1/graph/stats`: Knowledge graph topology metrics.
- `POST /api/v1/rag/search`: Filtered vector evidence retrieval.
- `GET /api/v1/cases/{case_id}/network`: Graph-ready nodes and edges for visual rendering.
- `GET /api/v1/cases/{case_id}/timeline`: Chronologically sorted case events.

### Grounded Query Example

```bash
curl -X POST http://localhost:8000/api/v1/investigation/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What connects Marcus Vance and Julian Thorne?",
    "case_id": "CASE-001"
  }'
```

---

## Investigation Workspace UI (Step 6)

The frontend delivers an enterprise SOC / intelligence analyst investigation workspace designed for desktop jury presentation.

### Core UI Capabilities

1. **Interactive SVG Network Graph**:
   - Zero external canvas dependencies; pure interactive SVG with pan, zoom, fit-to-view, and entity-type badging.
   - **Visual De-cluttering**: Highlights the primary nexus (`Marcus Vance (P-001) → Account A-001 ← Julian Thorne (P-004)`) by default without overwhelming the screen with all 37 entities.
   - View filters for `Core Nexus`, `All 37 Nodes`, and `Financial Bridge`.

2. **Bidirectional AI-to-Graph Traceability**:
   - Every grounded finding cites explicit IDs (`EVD-005`, `SRC-011`, `REL-001`, `REL-002`, `P-001`, `A-001`).
   - Clicking any ID immediately focuses that node, edge, or evidence item in the inspector panel.

3. **Citation Hierarchy**:
   - **Primary Finding (Direct Proof)**: Prominently elevates `EVD-005`, `SRC-011`, `REL-001`, and `REL-002`.
   - **Additional Retrieved Context**: Organizes supporting evidence, sources, and entities cleanly in an expandable secondary view.

4. **Time-Aware Investigation Replay**:
   - Interactive timeline scrubber with Play/Pause and step controls.
   - Synchronously highlights active entities and communication/transfer edges on the graph during event playback.

5. **Evidence Provenance & Verification Badges**:
   - Complete 5-step provenance trace (`Entity → Relationship → Source → Evidence → Case`).
   - Distinct badges for `VERIFIED`, `OBSERVED`, `AMBIGUOUS`, and `CONTRADICTED`.
   - Safety warnings for contradicted statements and identity collisions (e.g., `David Vance` suspect `P-002` vs innocent engineer `P-011`).

6. **Executive Investigation Briefing**:
   - One-click modal generating an executive intelligence briefing draft with draft watermark.

---

## Testing & Verification

### Automated Backend Tests (51/51 Passing)
```bash
cd backend
pytest
```

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

### Full Frontend API Contract Verification
```bash
python scripts/verify_step6_frontend_api.py
```

---

## Quick Demo Walkthrough

1. Start Backend: `uvicorn app.main:app --port 8000` (in `backend/`)
2. Start Frontend: `npm run dev` (in `frontend/`)
3. Open `http://localhost:5173` — **Operation Meridian (CASE-001)** loads automatically with zero manual configuration.
4. **Graph Focus**: Notice the clear focal path: `Marcus Vance (P-001) → Account A-001 ← Julian Thorne (P-004)`.
5. **Inspect Provenance**: Click the edge `REL-001` or `REL-002` to view the full evidence chain in the right panel.
6. **Replay Timeline**: Click Play in the bottom scrubber to watch events illuminate across the network.
7. **Ask AI Assistant**: Click the suggested query *"What connects Marcus Vance and Julian Thorne?"* — examine the grounded answer with the **Primary Finding** proof cards (`EVD-005`, `SRC-011`, `REL-001`, `REL-002`).
8. **Ambiguity Handling**: Click *"Show David Vance"* to see candidate disambiguation (`P-002` vs `P-011`).
9. **Executive Brief**: Click **Briefing Preview** in the top bar to inspect the final exportable case summary.
