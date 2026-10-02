# LungGuide AI

**Evidence-Grounded Lung Cancer Screening Assistant**

LungGuide AI is a Retrieval-Augmented Generation (RAG) system that answers questions about lung cancer screening using trusted guideline documents. Every answer is grounded in retrieved evidence with source citations and a separate evidence panel.

> **Disclaimer:** This is an educational evidence-retrieval assistant — not a substitute for professional medical advice, diagnosis, or treatment.

## Features

- Evidence-based Q&A with source citations
- Evidence panel showing retrieved passages
- Safety refusals (out-of-scope, ambiguous, prompt injection)
- Insufficient-evidence detection (no hallucinated answers)
- Retrieval transparency (scores, thresholds, gate status)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Python + FastAPI |
| RAG | LangChain + ChromaDB |
| LLM | Google Gemini `gemini-2.5-flash` |
| Embeddings | Google Gemini `gemini-embedding-001` |

## Quick Start

### 1. Prerequisites

- Python 3.11+
- Node.js 18+
- Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### 2. Configure environment

```powershell
cd "D:\Projects of Hackathone\lungguide-ai"
copy .env.example .env
```

Edit `.env` and set your `GEMINI_API_KEY`. Keep this file private; it is excluded by `.gitignore`.

### 3. Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Index sample documents
python scripts/ingest.py

# Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding Documents

Place `.txt`, `.md`, or `.pdf` files in:

```
backend/data/documents/
```

Then re-index via the UI **Re-index documents** button, or:

```powershell
python backend/scripts/ingest.py --reset
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + index status |
| POST | `/api/ingest` | Index documents from `data/documents/` |
| POST | `/api/chat` | Ask a question |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
lungguide-ai/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry
│   │   ├── routes.py        # API routes
│   │   ├── config.py        # Settings
│   │   ├── schemas.py       # Pydantic models
│   │   └── services/
│   │       ├── ingestion.py # Document loading & chunking
│   │       ├── vector_store.py
│   │       ├── retriever.py
│   │       ├── generator.py # Gemini answer generation
│   │       └── safety.py    # Scope & refusal logic
│   ├── data/documents/      # Guideline source files
│   └── scripts/ingest.py
├── frontend/
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── ChatPanel.tsx
│           └── EvidencePanel.tsx
└── .env.example

