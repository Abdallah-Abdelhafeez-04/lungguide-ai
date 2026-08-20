import type { ChatMessage, ChatResponse } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";

export async function sendQuestion(
  question: string,
  history: ChatMessage[] = [],
  allowWebSearch?: boolean,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      history: history.map(({ role, content }) => ({ role, content })),
      allow_web_search: allowWebSearch ?? null,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Request failed");
  }

  return res.json();
}

export async function checkHealth(): Promise<{
  status: string;
  documents_indexed: number;
  vector_store_ready: boolean;
}> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function ingestDocuments(): Promise<{ indexed_chunks: number }> {
  const res = await fetch(`${API_BASE}/ingest`, { method: "POST" });
  if (!res.ok) throw new Error("Ingestion failed");
  return res.json();
}
