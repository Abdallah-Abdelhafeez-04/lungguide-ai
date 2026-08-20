import { useState } from "react";
import type { ConversationSession } from "../types";

interface Props {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, event: React.MouseEvent) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  isOpen,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:static lg:w-72 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
                Chats ({sessions.length})
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <button
            onClick={onNewChat}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition ${
              activeSessionId === null
                ? "bg-teal-800 text-white ring-2 ring-teal-400 dark:bg-teal-600"
                : "bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            }`}
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>New Chat</span>
          </button>

          {/* Quick Search */}
          {sessions.length > 2 && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search chats…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {/* If currently in New Chat draft mode */}
          {activeSessionId === null && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 p-3 text-xs font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="truncate">New Chat (Draft)</span>
            </div>
          )}

          {filteredSessions.length === 0 && activeSessionId !== null ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              {search ? "No matching chats found." : "No saved chats yet. Click '+ New Chat' to begin."}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex cursor-pointer items-start justify-between rounded-xl p-3 text-left transition ${
                    isActive
                      ? "bg-teal-50/90 text-teal-950 border-l-4 border-l-teal-600 border border-teal-200/80 shadow-xs dark:bg-teal-950/60 dark:text-teal-100 dark:border-teal-800"
                      : "border border-transparent text-slate-700 hover:bg-white hover:border-slate-200 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:border-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className={`truncate text-xs ${isActive ? "font-bold" : "font-semibold"}`}>
                      {session.title || "Screening Discussion"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{formatDate(session.updatedAt)}</span>
                      <span>·</span>
                      <span>{session.messages.length} msgs</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    title="Delete chat"
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-700 transition dark:hover:bg-rose-950/80 dark:hover:text-rose-300"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        {sessions.length > 0 && (
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <button
              onClick={onClearAll}
              className="w-full rounded-lg py-1.5 text-center text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              Clear All Chats
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
