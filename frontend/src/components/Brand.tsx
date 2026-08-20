export function LungMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid place-items-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15 ${compact ? "h-9 w-9" : "h-11 w-11"}`} aria-hidden="true">
      <svg viewBox="0 0 44 44" className={compact ? "h-6 w-6" : "h-8 w-8"} fill="none">
        <path d="M20.5 6v12.6c-3.2-4.7-7.9-7-11.2-5.6-4.2 1.8-4.1 10.8-2.2 16.2 1.8 5.2 5.7 7.2 9.7 5.6 2.7-1.1 3.7-3.8 3.7-8V18.6M23.5 6v12.6c3.2-4.7 7.9-7 11.2-5.6 4.2 1.8 4.1 10.8 2.2 16.2-1.8 5.2-5.7 7.2-9.7 5.6-2.7-1.1-3.7-3.8-3.7-8V18.6" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function LungIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-950 via-teal-800 to-cyan-700 p-6 shadow-2xl shadow-teal-950/25">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative h-full rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-teal-50/80">
          <span>Evidence view</span><span className="rounded-full bg-emerald-300/20 px-2 py-1 text-emerald-100">Verified</span>
        </div>
        <svg viewBox="0 0 330 260" className="h-[72%] w-full" aria-label="Illustration of lungs with evidence pathways" role="img">
          <path d="M165 28v58c-22-29-54-43-78-32-30 14-29 77-15 116 13 36 41 51 69 39 18-8 24-25 24-52V86m0-58v58c22-29 54-43 78-32 30 14 29 77 15 116-13 36-41 51-69 39-18-8-24-25-24-52V86" fill="#c7f9f1" fillOpacity=".95" stroke="#f0fdfa" strokeWidth="6" strokeLinecap="round" />
          <path d="M165 28v165M144 93l-35-21M186 93l35-21M146 138l-44 9M184 138l44 9" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
          <circle cx="109" cy="72" r="7" fill="#0f766e"/><circle cx="221" cy="72" r="7" fill="#0f766e"/><circle cx="102" cy="147" r="7" fill="#0f766e"/><circle cx="228" cy="147" r="7" fill="#0f766e"/>
          <rect x="37" y="199" width="256" height="32" rx="16" fill="white" fillOpacity=".16" />
          <path d="M64 215h97M179 215h37M229 215h30" stroke="white" strokeOpacity=".86" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-950/25 p-3 text-sm text-white">
          <p className="font-semibold">Grounded before generated.</p>
          <p className="mt-1 text-xs text-teal-50/80">Every response is linked to retrieved guideline evidence.</p>
        </div>
      </div>
    </div>
  );
}
