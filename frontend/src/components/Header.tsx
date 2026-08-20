import { LungMark } from "./Brand";

export type Page = "home" | "ask" | "how-it-works" | "about";

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
  indexed: number | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ page, onNavigate, indexed, isDark, onToggleTheme }: Props) {
  const links: Array<{ label: string; page: Page }> = [
    { label: "Home", page: "home" },
    { label: "Ask LungGuide", page: "ask" },
    { label: "How It Works", page: "how-it-works" },
    { label: "About", page: "about" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3 text-left">
          <LungMark compact />
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-950 dark:text-white">
              LungGuide <span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Evidence-first screening
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                page === link.page
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {indexed === null ? "Checking evidence" : `${indexed} evidence chunks`}
          </div>

          <button
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <>
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs font-bold text-amber-400">Light</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-xs font-bold text-slate-700">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
