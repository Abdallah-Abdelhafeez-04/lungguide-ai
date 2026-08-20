"""Document ingestion: load, chunk, and index guideline files."""

from __future__ import annotations

import re
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.config import settings
from app.services.vector_store import vector_store


def load_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def load_pdf(path: Path) -> list[tuple[str, str]]:
    reader = PdfReader(str(path))
    pages: list[tuple[str, str]] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append((str(index), text))
    return pages


def infer_section(text: str) -> str:
    for line in text.splitlines()[:3]:
        cleaned = line.strip()
        if cleaned and len(cleaned) < 120:
            return cleaned
    return ""


def chunk_text(
    text: str,
    document_name: str,
    page: str = "",
    section: str = "",
) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    results: list[dict] = []
    for chunk in chunks:
        chunk_section = section or infer_section(chunk)
        results.append(
            {
                "text": chunk,
                "metadata": {
                    "document": document_name,
                    "section": chunk_section,
                    "page": page,
                },
            }
        )
    return results


def ingest_path(path: Path, reset: bool = False) -> int:
    if reset:
        vector_store.reset()

    all_chunks: list[dict] = []

    if path.is_file():
        files = [path]
    else:
        files = sorted(
            list(path.glob("**/*.txt"))
            + list(path.glob("**/*.md"))
            + list(path.glob("**/*.pdf"))
        )

    for file_path in files:
        document_name = file_path.stem.replace("_", " ")
        doc_chunks: list[dict] = []

        if file_path.suffix.lower() == ".pdf":
            pages = load_pdf(file_path)
            for page_num, page_text in pages:
                doc_chunks.extend(
                    chunk_text(page_text, document_name, page=page_num)
                )
        else:
            text = load_text_file(file_path)
            # Split markdown-style sections when possible
            sections = re.split(r"\n(?=#{1,3}\s)", text)
            if len(sections) <= 1:
                doc_chunks.extend(chunk_text(text, document_name))
            else:
                for section in sections:
                    title = infer_section(section)
                    doc_chunks.extend(
                        chunk_text(section, document_name, section=title)
                    )

        print(f"Loaded '{file_path.name}': {len(doc_chunks)} chunks.", flush=True)
        all_chunks.extend(doc_chunks)

    if not all_chunks:
        return 0

    return vector_store.add_documents(
        texts=[c["text"] for c in all_chunks],
        metadatas=[c["metadata"] for c in all_chunks],
    )


def ingest_default_documents(reset: bool = False) -> int:
    settings.documents_dir.mkdir(parents=True, exist_ok=True)
    return ingest_path(settings.documents_dir, reset=reset)
