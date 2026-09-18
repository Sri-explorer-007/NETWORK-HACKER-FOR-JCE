from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.init_db import create_tables
from app.models.evidence import Evidence
from app.models.vector_embedding import VectorEmbedding
from app.rag.document import build_evidence_document, EvidenceDocument
from app.rag.chunker import chunk_document, EvidenceChunk
from app.rag.embeddings import get_embedding_provider, EmbeddingProvider
from app.rag.vector_store import get_vector_store, VectorStore, SearchResult
from app.rag.metadata import RAGFilters
from app.rag.config import rag_config


class RAGRetrieverService:
    """High-level service coordinating document processing, vector indexing, and filtered semantic retrieval."""

    def __init__(
        self,
        embedding_provider: Optional[EmbeddingProvider] = None,
        vector_store: Optional[VectorStore] = None,
    ):
        self.embedding_provider = embedding_provider or get_embedding_provider()
        self.vector_store = vector_store or get_vector_store()

    def index_all_evidence(self, db: Session, force_reindex: bool = False) -> Dict[str, Any]:
        """Loads all evidence, creates enriched documents, chunks them, generates embeddings, and updates the vector index."""
        create_tables()
        print("[ RAG ] Loading evidence")
        evidence_records = db.query(Evidence).all()
        
        if force_reindex:
            self.vector_store.delete_embeddings(db=db)

        # 1. Convert Evidence into Documents
        documents: List[EvidenceDocument] = []
        for ev in evidence_records:
            doc = build_evidence_document(ev, db=db)
            documents.append(doc)
        print(f"[ RAG ] Documents created ({len(documents)} documents)")

        # 2. Chunk Documents
        all_chunks: List[EvidenceChunk] = []
        for doc in documents:
            chunks = chunk_document(doc)
            all_chunks.extend(chunks)
        print(f"[ RAG ] Chunks created ({len(all_chunks)} chunks)")

        # 3. Generate Vector Embeddings
        chunk_texts = [c.text for c in all_chunks]
        embeddings = self.embedding_provider.embed_texts(chunk_texts)
        print(f"[ RAG ] Embeddings generated ({len(embeddings)} vectors)")

        # 4. Store in Vector Store
        self.vector_store.add_embeddings(all_chunks, embeddings, db=db)
        print("[ RAG ] Vector index updated")

        return {
            "status": "completed",
            "evidence_processed": len(evidence_records),
            "documents_created": len(documents),
            "chunks_created": len(all_chunks),
            "embeddings_created": len(embeddings),
        }

    def search(
        self,
        query: str,
        case_id: Optional[str] = None,
        top_k: int = 5,
        filters: Optional[RAGFilters] = None,
        db: Session = None,
    ) -> Dict[str, Any]:
        """Performs vector similarity search against indexed evidence chunks with metadata filters."""
        print(f"[ RAG ] Query received: '{query}' (case_id={case_id}, top_k={top_k})")
        
        if not query or not query.strip() or not db:
            return {"query": query, "case_id": case_id, "total_results": 0, "results": []}

        # Ensure tables exist
        create_tables()

        # Merge case_id into filters if supplied
        active_filters = filters or RAGFilters()
        if case_id and not active_filters.case_id:
            active_filters.case_id = case_id

        # 1. Embed query
        query_vector = self.embedding_provider.embed_text(query)

        # 2. Search vector store
        effective_top_k = min(max(top_k, 1), rag_config.MAX_TOP_K)
        raw_results: List[SearchResult] = self.vector_store.similarity_search(
            query_vector=query_vector,
            top_k=effective_top_k,
            filters=active_filters,
            db=db,
        )

        # 3. Format response preserving full provenance
        formatted_results = []
        for res in raw_results:
            formatted_results.append({
                "evidence_id": res.evidence_id,
                "source_id": res.source_id,
                "case_id": res.case_id,
                "document_id": res.document_id,
                "chunk_id": res.chunk_id,
                "text": res.text,
                "score": res.score,
                "metadata": res.metadata,
            })

        print(f"[ RAG ] Retrieval completed: found {len(formatted_results)} matching evidence records")

        return {
            "query": query,
            "case_id": active_filters.case_id,
            "total_results": len(formatted_results),
            "results": formatted_results,
        }

    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Returns statistics on indexed documents, chunks, embeddings, and distinct cases."""
        create_tables()
        total_embeddings = self.vector_store.count_embeddings(db=db)
        
        # Distinct documents & cases indexed in vector store
        distinct_docs = db.query(func.count(func.distinct(VectorEmbedding.document_id))).scalar() or 0
        distinct_chunks = db.query(func.count(func.distinct(VectorEmbedding.chunk_id))).scalar() or 0
        distinct_cases = db.query(func.count(func.distinct(VectorEmbedding.case_id))).filter(VectorEmbedding.case_id.isnot(None)).scalar() or 0

        return {
            "documents": distinct_docs,
            "chunks": distinct_chunks,
            "embeddings": total_embeddings,
            "cases_indexed": distinct_cases,
        }


# Global singleton instance
rag_service = RAGRetrieverService()
