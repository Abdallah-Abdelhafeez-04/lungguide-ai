import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import AnswerContent from "./AnswerContent";

interface Props {
  messages: ChatMessage[];
  onSend: (question: string, allowWebSearch?: boolean) => Promise<void>;
  onClear?: () => void;
  loading: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  sessionTitle?: string;
}

const SUGGESTIONS = [
  "Who is eligible for lung cancer screening?",
  "I am coughing — what does the research say?",
  "What is LDCT screening according to guidelines?",
  "What are the risks and overdiagnosis rates?",
];

export default function ChatPanel({
  messages,
  onSend,
  onClear,
  loading,
  isSidebarOpen,
  onToggleSidebar,
  sessionTitle,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    await onSend(question);
  };

  return (
    <div className="flex min-h-[650px] flex-col bg-white transition-colors duration-200 dark:bg-slate-900">
      {/* Active Conversation Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={isSidebarOpen ? "Collapse history sidebar" : "Open history sidebar"}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="hidden sm:inline">{isSidebarOpen ? "History" : "History"}</span>
            </button>
          )}

          {sessionTitle ? (
            <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[220px] sm:max-w-xs">
              {sessionTitle}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {messages.length > 0 ? `Active Chat (${messages.length} msgs)` : "New Discussion"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onClear && messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-xs transition hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              + New Chat
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-7 px-5 py-7 lg:px-8">
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl py-12 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-2xl dark:bg-teal-950/60 dark:text-teal-300">
              ⌕
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Ask a screening question</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
              LungGuide retrieves supporting guideline passages and peer-reviewed literature before answering. Supports multi-turn follow-up questions.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSend(suggestion)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-medium text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:bg-slate-700 dark:hover:text-teal-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {message.role === "user" ? (
              <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-teal-700 px-4 py-3 text-sm font-medium text-white shadow-sm dark:bg-teal-600">
                {message.content}
              </div>
            ) : (
              <div
                className={`w-full max-w-3xl rounded-2xl border p-5 shadow-sm transition-colors duration-200 ${
                  message.response?.refused
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/80"
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-700 text-xs text-white dark:bg-teal-600">LG</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">LungGuide AI</span>
                  {message.response?.refused && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      Safety response
                    </span>
                  )}
                </div>

                <AnswerContent content={message.content} />

                {message.response && !message.response.refused && message.response.citations.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700/60">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                      Sources used in this answer
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {message.response.citations.map((citation, sourceIndex) => {
                        const isGuideline =
                          citation.source_type === "guideline" ||
                          citation.document.toLowerCase().includes("recommendation") ||
                          citation.document.toLowerCase().includes("guideline") ||
                          citation.document.toLowerCase().includes("uspstf") ||
                          citation.document.toLowerCase().includes("acs");
                        const isWeb = citation.source_type === "web" || !!citation.url;

                        return (
                          <div
                            key={`${citation.document}-${sourceIndex}`}
                            className={`rounded-xl p-3 border transition-colors ${
                              isWeb
                                ? "bg-cyan-50/40 border-cyan-200/60 dark:bg-cyan-950/30 dark:border-cyan-900/40"
                                : isGuideline
                                ? "bg-emerald-50/40 border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-900/40"
                                : "bg-indigo-50/40 border-indigo-200/60 dark:bg-indigo-950/30 dark:border-indigo-900/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`inline-grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                                  isWeb
                                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                                    : isGuideline
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                }`}
                              >
                                {sourceIndex + 1}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  isWeb
                                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200"
                                    : isGuideline
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
                                }`}
                              >
                                {isWeb ? "Web Source" : isGuideline ? "Guideline" : "Research"}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                              {citation.document}
                            </span>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {citation.section || "Relevant evidence passage"}
                              {citation.page ? ` · Page ${citation.page}` : ""}
                            </p>
                            {citation.url ? (
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-block break-all text-[11px] font-medium text-cyan-700 underline dark:text-cyan-300"
                              >
                                {citation.url}
                              </a>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex">
            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-600 dark:bg-teal-400" />
              Retrieving guideline evidence…
            </div>
          </div>
        )}

        {!loading && messages[messages.length - 1]?.response?.needs_web_search_consent && (
          <div className="flex flex-wrap gap-2 px-1">
            <button
              type="button"
              onClick={() => onSend("yes, search the web", true)}
              className="rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-800 dark:bg-teal-600"
            >
              Yes, search the web
            </button>
            <button
              type="button"
              onClick={() => onSend("no, guidelines only", false)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              No, guidelines only
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={submit}
        className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="mx-auto flex max-w-4xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            placeholder="Ask about lung cancer screening…"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-950"
          />
          <button
            disabled={loading || !input.trim()}
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Ask
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] text-slate-400 dark:text-slate-500">
          Educational evidence retrieval only. Not medical diagnosis or personal treatment advice.
        </p>
      </form>
    </div>
  );
}
