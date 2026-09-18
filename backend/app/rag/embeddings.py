import math
import hashlib
import re
from abc import ABC, abstractmethod
from typing import List
import httpx

from app.rag.config import rag_config


class EmbeddingProvider(ABC):
    """Abstract interface for generating vector embeddings."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Generate vector embedding for a single text."""
        pass

    @abstractmethod
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings for a batch of texts."""
        pass


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """API-based embedding provider using OpenAI compatible endpoint."""

    def __init__(self, api_key: str, model: str = "text-embedding-3-small"):
        self.api_key = api_key
        self.model = model
        self.client = httpx.Client(timeout=30.0)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "input": texts,
            "model": self.model,
        }
        response = self.client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]

    def embed_text(self, text: str) -> List[float]:
        results = self.embed_texts([text])
        return results[0] if results else []


class DeterministicDevEmbeddingProvider(EmbeddingProvider):
    """DEVELOPMENT ONLY: Deterministic semantic feature projection vectorizer.
    
    Provides fast, reproducible, zero-external-dependency embeddings for local development,
    CI tests, and offline hackathon environments. Uses multi-ngram hashing and L2 normalization
    to compute standard cosine similarity.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _normalize(self, vec: List[float]) -> List[float]:
        norm = math.sqrt(sum(x * x for x in vec))
        if norm == 0.0:
            return [0.0] * self.dimension
        return [round(x / norm, 6) for x in vec]

    def _hash_token(self, token: str, seed: int = 0) -> int:
        h = hashlib.md5(f"{seed}:{token}".encode("utf-8")).hexdigest()
        return int(h, 16) % self.dimension

    def embed_text(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        clean_text = text.lower()
        
        # Tokenize words and alphanumeric codes (e.g. EVD-001, P-001, CASE-001, 2026-01-15)
        tokens = re.findall(r"[a-z0-9_\-\+]+", clean_text)
        
        if not tokens:
            return vec

        # 1. Unigram feature projection with term frequency weighting
        for token in tokens:
            idx = self._hash_token(token, seed=42)
            sign = 1.0 if (self._hash_token(token, seed=101) % 2 == 0) else -1.0
            vec[idx] += sign * 1.5

            # Sub-token character 3-grams for typo and partial match tolerance
            if len(token) >= 3:
                for i in range(len(token) - 2):
                    sub = token[i:i+3]
                    sub_idx = self._hash_token(sub, seed=17)
                    vec[sub_idx] += 0.4

        # 2. Bigram feature projection for phrase semantics (e.g. "marcus vance", "dock 9", "shared account")
        for i in range(len(tokens) - 1):
            bigram = f"{tokens[i]} {tokens[i+1]}"
            b_idx = self._hash_token(bigram, seed=99)
            vec[b_idx] += 2.0

        # 3. Trigram feature projection for structured investigation patterns
        for i in range(len(tokens) - 2):
            trigram = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
            t_idx = self._hash_token(trigram, seed=137)
            vec[t_idx] += 2.5

        return self._normalize(vec)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]


def get_embedding_provider() -> EmbeddingProvider:
    """Factory function returning configured embedding provider (OpenAI if API key set, otherwise deterministic dev provider)."""
    if rag_config.EMBEDDING_API_KEY:
        print(f"[ RAG ] Initialized API Embedding Provider ({rag_config.EMBEDDING_MODEL})")
        return OpenAIEmbeddingProvider(
            api_key=rag_config.EMBEDDING_API_KEY,
            model=rag_config.EMBEDDING_MODEL,
        )
    else:
        # Development fallback
        return DeterministicDevEmbeddingProvider(dimension=rag_config.EMBEDDING_DIMENSION)
