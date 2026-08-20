import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text
    .split(/(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|\[\d+(?:,\s*\d+)*\])/g)
    .filter(Boolean)
    .map((part, index) => {
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (link) {
        return (
          <a
            key={index}
            href={link[2]}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800 dark:text-teal-300"
          >
            {link[1]}
          </a>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (/^\[\d+(?:,\s*\d+)*\]$/.test(part)) {
        return <sup key={index} className="ml-0.5 rounded bg-teal-50 px-1 text-[10px] font-bold text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">{part}</sup>;
      }
      return <span key={index}>{part}</span>;
    });
}

export default function AnswerContent({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-7 text-slate-700 dark:text-slate-300">
      {content.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("### ")) return <h3 key={index} className="pt-3 text-base font-bold text-slate-950 dark:text-white">{inline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith("## ")) return <h2 key={index} className="pt-2 text-lg font-bold tracking-tight text-slate-950 dark:text-white">{inline(trimmed.slice(3))}</h2>;
        if (/^[-*] /.test(trimmed)) return <div key={index} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" /> <p>{inline(trimmed.slice(2))}</p></div>;
        return <p key={index}>{inline(trimmed)}</p>;
      })}
    </div>
  );
}
