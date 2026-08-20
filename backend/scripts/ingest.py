"""CLI script to ingest documents into the vector store."""

import argparse
import sys
from pathlib import Path

# Allow running from backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.services.ingestion import ingest_default_documents, ingest_path  # noqa: E402
from app.services.vector_store import vector_store


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest lung screening documents")
    parser.add_argument(
        "--path",
        type=Path,
        default=None,
        help="Path to a file or directory (defaults to backend/data/documents)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear existing vector store before ingesting",
    )
    args = parser.parse_args()

    try:
        if not args.reset and not args.path and vector_store.count > 0:
            print(f"Vector store already contains {vector_store.count} chunks. Skipping auto-ingest.")
            return

        if not settings.gemini_api_key:
            print("WARNING: GEMINI_API_KEY is not configured. Skipping document ingestion. Configure your API key and re-index via UI or CLI.")
            return

        if args.path:
            count = ingest_path(args.path, reset=args.reset)
        else:
            count = ingest_default_documents(reset=args.reset)

        print(f"Indexed {count} chunks.")
    except Exception as exc:
        print(f"Ingestion warning/error: {exc}")
        print("Continuing startup so web server can launch...")


if __name__ == "__main__":
    main()

