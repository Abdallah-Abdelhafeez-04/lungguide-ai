"""Chroma vector store wrapper."""

from __future__ import annotations

import uuid

import chromadb
from chromadb.config import Settings as ChromaSettings
from google import genai

from app.config import settings


class VectorStore:
    COLLECTION_NAME = "lung_screening_evidence"
    EMBEDDING_BATCH_SIZE = 100
    # gemini-embedding-2 on the Gemini API collapses a string list into one
    # Content (one vector). Embed one chunk per request and stay under 100 RPM.
    GEMINI_EMBED_PAUSE_SEC = 0.7

    def __init__(self) -> None:
        settings.chroma_dir.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=str(settings.chroma_dir),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self.client_for_embeddings = genai.Client(api_key=settings.gemini_api_key)

    @property
    def count(self) -> int:
        return self.collection.count()

    def reset(self) -> None:
        self.client.delete_collection(self.COLLECTION_NAME)
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    def add_documents(
        self,
        texts: list[str],
        metadatas: list[dict],
    ) -> int:
        import math

        valid_texts = []
        valid_metas = []
        for t, m in zip(texts, metadatas):
            if t and t.strip():
                valid_texts.append(t.strip())
                valid_metas.append(m)

        if not valid_texts:
            return 0

        raw_vectors = self._embed(valid_texts)

        # Filter any vectors containing NaN or unexpected dimensions
        filtered_ids = []
        filtered_texts = []
        filtered_vectors = []
        filtered_metas = []
        for t, m, v in zip(valid_texts, valid_metas, raw_vectors):
            if v and isinstance(v, list) and len(v) > 0 and not any(math.isnan(x) for x in v):
                filtered_ids.append(str(uuid.uuid4()))
                filtered_texts.append(t)
                filtered_vectors.append(v)
                filtered_metas.append(m)

        if not filtered_texts:
            return 0

        # Batch insert into Chroma
        batch_size = 100
        for i in range(0, len(filtered_texts), batch_size):
            self.collection.add(
                ids=filtered_ids[i : i + batch_size],
                documents=filtered_texts[i : i + batch_size],
                embeddings=filtered_vectors[i : i + batch_size],
                metadatas=filtered_metas[i : i + batch_size],
            )

        return len(filtered_texts)

    def query(self, question: str, top_k: int) -> list[dict]:
        if self.count == 0:
            return []

        query_vector = self._embed([question])[0]
        results = self.collection.query(
            query_embeddings=[query_vector],
            n_results=min(top_k, self.count),
            include=["documents", "metadatas", "distances"],
        )

        chunks: list[dict] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ids = results.get("ids", [[]])[0]

        for chunk_id, doc, meta, distance in zip(ids, docs, metas, distances):
            # Chroma cosine distance: 0 = identical, 2 = opposite. Convert to similarity.
            score = max(0.0, 1.0 - (distance / 2.0))
            doc_name = meta.get("document", "Unknown")
            doc_lower = doc_name.lower()

            if any(k in doc_lower for k in ["recommendation", "guideline", "uspstf", "acs", "jama", "screening", "piis"]):
                source_type = "guideline"
            else:
                source_type = "research"

            chunks.append(
                {
                    "id": chunk_id,
                    "content": doc,
                    "score": round(score, 4),
                    "document": doc_name,
                    "section": meta.get("section", ""),
                    "page": meta.get("page", ""),
                    "source_type": source_type,
                }
            )

        return sorted(chunks, key=lambda c: c["score"], reverse=True)

    def _parse_embeddings(self, res) -> list[list[float]]:
        if hasattr(res, "embeddings") and res.embeddings:
            return [list(item.values) for item in res.embeddings]
        if hasattr(res, "embedding") and res.embedding:
            return [list(res.embedding.values)]
        raise ValueError(f"Unexpected embedding response: {res}")

    def _embed_one(self, text: str, max_retries: int = 8) -> list[float]:
        import time

        backoff = 15.0
        last_error: Exception | None = None
        for attempt in range(max_retries):
            try:
                res = self.client_for_embeddings.models.embed_content(
                    model=settings.gemini_embedding_model,
                    contents=text,
                )
                vectors = self._parse_embeddings(res)
                if not vectors:
                    raise ValueError("Embedding API returned no vectors")
                return vectors[0]
            except Exception as exc:
                last_error = exc
                err_str = str(exc)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    print(
                        f"Rate limited (attempt {attempt + 1}/{max_retries}). "
                        f"Waiting {backoff:.0f}s...",
                        flush=True,
                    )
                    time.sleep(backoff)
                    backoff = min(backoff * 1.5, 120.0)
                    continue
                if attempt < max_retries - 1:
                    time.sleep(2.0)
                    continue
                raise
        raise last_error or RuntimeError("Embedding failed")

    def _embed(self, texts: list[str]) -> list[list[float]]:
        """Create embeddings one chunk at a time, paced for Gemini free-tier RPM."""
        import time

        if not texts:
            return []

        print(
            f"Generating embeddings for {len(texts)} chunks "
            f"(1 request each, pause={self.GEMINI_EMBED_PAUSE_SEC}s)...",
            flush=True,
        )

        vectors: list[list[float]] = []
        for index, text in enumerate(texts, start=1):
            vectors.append(self._embed_one(text))
            if index % 25 == 0 or index == len(texts):
                print(f"Embedded {index}/{len(texts)} chunks...", flush=True)
            if index < len(texts):
                time.sleep(self.GEMINI_EMBED_PAUSE_SEC)

        print(f"Generated {len(vectors)} embeddings successfully.", flush=True)
        return vectors


vector_store = VectorStore()
