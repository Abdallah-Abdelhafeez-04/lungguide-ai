"""Retrieval service with evidence gate."""

from app.config import settings
from app.schemas import EvidenceChunk, RetrievalMeta
from app.services.vector_store import vector_store


def retrieve(question: str) -> tuple[list[EvidenceChunk], RetrievalMeta]:
    if vector_store.count == 0:
        try:
            from app.services.ingestion import ingest_default_documents
            ingest_default_documents()
        except Exception as exc:
            print(f"Auto-ingest error: {exc}", flush=True)

    raw_chunks = vector_store.query(question, top_k=settings.retrieval_top_k)
    evidence = [EvidenceChunk(**chunk) for chunk in raw_chunks]
    max_score = max((c.score for c in evidence), default=None)

    passed = bool(
        evidence
        and max_score is not None
        and max_score >= settings.min_relevance_score
    )

    meta = RetrievalMeta(
        query=question,
        top_k=settings.retrieval_top_k,
        min_score_threshold=settings.min_relevance_score,
        chunks_retrieved=len(evidence),
        max_score=max_score,
        passed_evidence_gate=passed,
    )
    return evidence, meta
