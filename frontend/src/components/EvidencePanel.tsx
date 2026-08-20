import { useState } from "react";
import type { ChatResponse, EvidenceChunk, WebSource } from "../types";

export default function EvidencePanel({ response }: { response: ChatResponse | null }) {
  const [activeTab, setActiveTab] = useState<"all" | "guidelines" | "research" | "web">("all");

  if (!response) {
    return (
      <div className="grid min-h-[650px] place-items-center bg-white p-8 text-center transition-colors duration-200 dark:bg-slate-900">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-xl dark:bg-teal-950/60 dark:text-teal-300">
            ◫
          </div>
          <h2 className="mt-4 font-bold text-slate-900 dark:text-white">Evidence Workspace</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
            Retrieved guideline passages, peer-reviewed literature, and transparency metrics appear here.
          </p>
        </div>
      </div>
    );
  }

  const { evidence, retrieval, refused, refusal_reason } = response;
  const webSources: WebSource[] = response.web_sources ?? [];

  const guidelines = evidence.filter((chunk) => {
    const type = chunk.source_type || "";
    if (type === "guideline") return true;
    if (type === "research") return false;
    const doc = chunk.document.toLowerCase();
    return doc.includes("recommendation") || doc.includes("guideline") || doc.includes("uspstf") || doc.includes("acs") || doc.includes("jama") || doc.includes("piis");
  });

  const research = evidence.filter((chunk) => !guidelines.includes(chunk));

  const countTotal = evidence.length + webSources.length;

  return (
    <div className="min-h-[650px] bg-white transition-colors duration-200 dark:bg-slate-900">
      {/* Header & Metrics */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
          Retrieval Transparency
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Evidence Workspace</h2>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/70">
            <span className="block text-slate-400 dark:text-slate-500">Retrieved Passages</span>
            <b className="text-slate-800 dark:text-slate-200">{retrieval.chunks_retrieved} chunks</b>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/70">
            <span className="block text-slate-400 dark:text-slate-500">Max Relevance Score</span>
            <b className="text-slate-800 dark:text-slate-200">{retrieval.max_score?.toFixed(3) ?? "-"}</b>
          </div>
        </div>

        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
            retrieval.passed_evidence_gate
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
          }`}
        >
          {retrieval.passed_evidence_gate ? "Evidence Gate: Verified & Passed" : "Evidence Gate: Threshold Not Met"}
          {refused && ` · ${refusal_reason}`}
        </div>

        {/* Source Category Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              activeTab === "all"
                ? "bg-slate-900 text-white dark:bg-teal-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            All ({countTotal})
          </button>
          <button
            onClick={() => setActiveTab("guidelines")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              activeTab === "guidelines"
                ? "bg-emerald-700 text-white dark:bg-emerald-600"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            Guidelines ({guidelines.length})
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              activeTab === "research"
                ? "bg-indigo-700 text-white dark:bg-indigo-600"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
            }`}
          >
            Research ({research.length})
          </button>
          {webSources.length > 0 && (
            <button
              onClick={() => setActiveTab("web")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                activeTab === "web"
                  ? "bg-cyan-700 text-white dark:bg-cyan-600"
                  : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300"
              }`}
            >
              Web ({webSources.length})
            </button>
          )}
        </div>
      </div>

      {/* Evidence Content Sections */}
      <div className="space-y-4 p-4">
        {/* Section 1: Official Guidelines */}
        {(activeTab === "all" || activeTab === "guidelines") && guidelines.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Clinical Guidelines ({guidelines.length})
            </div>
            <div className="space-y-3">
              {guidelines.map((chunk: EvidenceChunk, index: number) => (
                <article
                  key={chunk.id}
                  className="rounded-2xl border border-emerald-200/70 bg-emerald-50/20 p-4 transition-colors duration-200 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        {index + 1}
                      </span>
                      <div>
                        <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                          Official Guideline
                        </span>
                        <h3 className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                          {chunk.document}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {chunk.section || "Recommendation section"}
                          {chunk.page ? ` · Page ${chunk.page}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      {chunk.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-300">{chunk.content}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Research Studies & Literature */}
        {(activeTab === "all" || activeTab === "research") && research.length > 0 && (
          <div>
            <div className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Research Literature &amp; Studies ({research.length})
            </div>
            <div className="space-y-3">
              {research.map((chunk: EvidenceChunk, index: number) => (
                <article
                  key={chunk.id}
                  className="rounded-2xl border border-indigo-200/70 bg-indigo-50/20 p-4 transition-colors duration-200 dark:border-indigo-900/40 dark:bg-indigo-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                        {index + 1}
                      </span>
                      <div>
                        <span className="inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                          Academic Research
                        </span>
                        <h3 className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                          {chunk.document}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {chunk.section || "Research study section"}
                          {chunk.page ? ` · Page ${chunk.page}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {chunk.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-700 dark:text-slate-300">{chunk.content}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Scraped & Live Web Sources */}
        {(activeTab === "all" || activeTab === "web") && webSources.length > 0 && (
          <div>
            <div className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Scraped &amp; Public Web Sources ({webSources.length})
            </div>
            <div className="space-y-3">
              {webSources.map((source: WebSource) => (
                <article
                  key={source.url}
                  className="rounded-2xl border border-cyan-200/70 bg-cyan-50/20 p-4 transition-colors duration-200 dark:border-cyan-900/40 dark:bg-cyan-950/20"
                >
                  <span className="inline-block rounded bg-cyan-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200">
                    Live Web Resource
                  </span>
                  <h3 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">{source.title}</h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-[11px] font-medium text-cyan-700 underline dark:text-cyan-300"
                  >
                    {source.url}
                  </a>
                  {source.snippet ? (
                    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{source.snippet}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        )}

        {countTotal === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            No evidence chunks retrieved for this query.
          </div>
        )}
      </div>
    </div>
  );
}
