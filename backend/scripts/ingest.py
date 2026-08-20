"""CLI script to ingest documents into the vector store."""

import argparse
import sys
from pathlib import Path

# Allow running from backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.ingestion import ingest_default_documents, ingest_path  # noqa: E402


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

    if args.path:
        count = ingest_path(args.path, reset=args.reset)
    else:
        count = ingest_default_documents(reset=args.reset)

    print(f"Indexed {count} chunks.")


if __name__ == "__main__":
    main()
