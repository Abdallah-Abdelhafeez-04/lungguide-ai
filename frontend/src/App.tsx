import { useCallback, useEffect, useState } from "react";
import { checkHealth, ingestDocuments, sendQuestion } from "./api";
import { LungIllustration, LungMark } from "./components/Brand";
import ChatPanel from "./components/ChatPanel";
import ChatSidebar from "./components/ChatSidebar";
import EvidencePanel from "./components/EvidencePanel";
import Header, { type Page } from "./components/Header";
import HowItWorks from "./components/HowItWorks";
import type { ChatMessage, ChatResponse, ConversationSession } from "./types";

const layers = [
  ["01", "Ingest", "Official PDFs are parsed, chunked, and tagged with document, section, and page metadata."],
  ["02", "Retrieve", "Semantic search surfaces the most relevant guideline passages before any response is written."],
  ["03", "Generate", "Gemini writes a structured answer from the retrieved evidence, using visible citation markers."],
  ["04", "Safeguard", "Scope checks, prompt-injection resistance, and an evidence threshold prevent unsupported answers."],
];

function Home({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <main className="bg-white transition-colors duration-200 dark:bg-slate-950">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(20,184,166,.22),transparent_29%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,.18),transparent_25%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-[72px] lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Evidence-grounded clinical information
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-[-.04em] text-white sm:text-5xl lg:text-6xl">
              Screening answers you can <span className="text-teal-300">verify.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              LungGuide AI is a focused RAG assistant for lung cancer screening. It retrieves official guideline passages before generating a concise, traceable answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("ask")}
                className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-teal-950 shadow-lg shadow-teal-500/10 transition hover:bg-teal-300"
              >
                Ask LungGuide
              </button>
              <button
                onClick={() => onNavigate("how-it-works")}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                How it works
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-slate-400">
              <span><b className="text-white">Grounded</b> in retrieved evidence</span>
              <span><b className="text-white">Transparent</b> sources and scores</span>
              <span><b className="text-white">Scoped</b> safety controls</span>
            </div>
          </div>
          <LungIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-[72px] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">Built for trustworthy RAG</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">A clear evidence path from guideline to answer.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {layers.map(([number, title, text]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{number}</span>
              <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-teal-100 bg-teal-50 transition-colors duration-200 dark:border-teal-900/40 dark:bg-teal-950/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">Ready for a live demo</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Show the answer and the evidence side by side.</h2>
          </div>
          <button
            onClick={() => onNavigate("ask")}
            className="w-fit rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Open Q&A workspace
          </button>
        </div>
      </section>
    </main>
  );
}

function About() {
  return (
    <main className="bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">About LungGuide AI</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">Clinical information that remains connected to its source.</h1>
          <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
            LungGuide AI is an educational, evidence-retrieval assistant for lung cancer screening. It is not a diagnostic tool and does not replace a clinician’s judgement or individual medical advice.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl bg-slate-950 p-6 text-white dark:border dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-300">What we provide</p>
            <h2 className="mt-3 text-xl font-bold">Evidence before explanation.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Guideline-grounded answers, clear citations, retrieved passages, and safety responses when the evidence is insufficient.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">Primary source</p>
            <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">USPSTF recommendation</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              The initial corpus uses the official USPSTF lung cancer screening recommendation statement and ACS updates, preserving document, section, and page metadata.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">Safety promise</p>
            <h2 className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Designed to fail safely.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Out-of-scope treatment questions, ambiguous prompts, injection attempts, and low-evidence results are handled with a clear refusal instead of a guess.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Multi-session state
  const [sessions, setSessions] = useState<ConversationSession[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lungguide_saved_sessions");
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lungguide_active_session_id") || null;
    }
    return null;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latestResponse, setLatestResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [indexed, setIndexed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lungguide_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // On mount only: load saved session if one was active
  useEffect(() => {
    if (activeSessionId) {
      const found = sessions.find((s) => s.id === activeSessionId);
      if (found) {
        setMessages(found.messages);
        setLatestResponse(found.latestResponse);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("lungguide_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("lungguide_theme", "light");
    }
  }, [isDark]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem("lungguide_saved_sessions", JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Persist active session id
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem("lungguide_active_session_id", activeSessionId);
      } else {
        localStorage.removeItem("lungguide_active_session_id");
      }
    } catch {
      // ignore
    }
  }, [activeSessionId]);

  useEffect(() => {
    checkHealth()
      .then((health) => setIndexed(health.documents_indexed))
      .catch(() => setIndexed(0));
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add("dark");
        localStorage.setItem("lungguide_theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("lungguide_theme", "light");
      }
      return next;
    });
  };

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Switch to another conversation
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setMessages(session.messages);
      setLatestResponse(session.latestResponse);
    }
  };

  // Start fresh new chat (clears active session so user has empty discussion)
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setLatestResponse(null);
    try {
      localStorage.removeItem("lungguide_active_session_id");
    } catch {
      // ignore
    }
  };

  // Delete a conversation
  const handleDeleteSession = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
        setLatestResponse(updated[0].latestResponse);
      } else {
        handleNewChat();
      }
    }
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
    setLatestResponse(null);
    try {
      localStorage.removeItem("lungguide_saved_sessions");
      localStorage.removeItem("lungguide_active_session_id");
    } catch {
      // ignore
    }
  };

  const handleIngest = async () => {
    try {
      setError(null);
      const result = await ingestDocuments();
      setIndexed(result.indexed_chunks);
    } catch {
      setError("Could not re-index documents. Confirm the backend is running.");
    }
  };

  const handleSend = useCallback(async (question: string, allowWebSearch?: boolean) => {
    setLoading(true);
    setError(null);

    const updatedUserMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(updatedUserMessages);

    // If starting a brand new chat, generate a unique session ID
    let currentId = activeSessionId;
    if (!currentId) {
      currentId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      setActiveSessionId(currentId);
    }

    try {
      const response = await sendQuestion(question, messages, allowWebSearch);
      setLatestResponse(response);

      const finalMessages: ChatMessage[] = [
        ...updatedUserMessages,
        { role: "assistant", content: response.answer, response },
      ];
      setMessages(finalMessages);

      // Save / update in sessions list
      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === currentId);
        const title = existingIdx >= 0 && prev[existingIdx].title
          ? prev[existingIdx].title
          : question.slice(0, 42) + (question.length > 42 ? "…" : "");

        const newSession: ConversationSession = {
          id: currentId!,
          title,
          createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : Date.now(),
          updatedAt: Date.now(),
          messages: finalMessages,
          latestResponse: response,
        };

        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = newSession;
          return clone.sort((a, b) => b.updatedAt - a.updatedAt);
        } else {
          return [newSession, ...prev];
        }
      });
    } catch {
      setError("We could not complete this request. Check that the backend is running and your Gemini key is valid.");
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "I could not retrieve an evidence-grounded answer at this time." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, activeSessionId]);

  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} bg-white text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100`}>
      <Header page={page} onNavigate={navigate} indexed={indexed} isDark={isDark} onToggleTheme={toggleTheme} />
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
          {error}
        </div>
      )}
      {page === "home" && <Home onNavigate={navigate} />}
      {page === "how-it-works" && <HowItWorks onNavigate={navigate} />}
      {page === "ask" && (
        <main className="bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
          <div className="mx-auto max-w-[1600px] px-3 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700 dark:text-teal-400">Guideline Q&A</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Ask. Verify. Understand.</h1>
              </div>
              <button
                onClick={handleIngest}
                className="w-fit rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-slate-800"
              >
                Re-index evidence
              </button>
            </div>

            {/* 3-Column Layout: Sidebar | Chat Panel | Evidence Workspace */}
            <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:grid-cols-[auto_minmax(0,1fr)_390px]">
              <ChatSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={handleDeleteSession}
                onClearAll={handleClearAllSessions}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((prev) => !prev)}
              />
              <section className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r dark:border-slate-800">
                <ChatPanel
                  messages={messages}
                  onSend={handleSend}
                  onClear={handleNewChat}
                  loading={loading}
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                  sessionTitle={currentSession?.title}
                />
              </section>
              <aside className="min-w-0">
                <EvidencePanel response={latestResponse} />
              </aside>
            </div>
          </div>
        </main>
      )}
      {page === "about" && <About />}
      <footer className="border-t border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <LungMark compact />
            <span>© 2026 LungGuide AI · Educational evidence retrieval</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-50 px-3 py-1 font-bold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
              Evidence-First Clinical RAG
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Built for transparent, grounded clinical AI.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
