import type { Page } from "./Header";

interface Props {
  onNavigate: (page: Page) => void;
}

export default function HowItWorks({ onNavigate }: Props) {
  const guardrails = [
    {
      code: "GUARDRAIL_BLOCKED",
      title: "Adversarial & Jailbreak Defense",
      desc: "Detects and neutralizes prompt injections, DAN mode, persona overrides, and instruction bypasses.",
      badge: "Security",
    },
    {
      code: "TREATMENT_PRESCRIPTION_REFUSAL",
      title: "Chemotherapy & Prescription Refusal",
      desc: "Refuses drug dosages, chemo regimens, and prescriptions, redirecting users to an oncologist.",
      badge: "Scope Control",
    },
    {
      code: "INDIVIDUAL_DIAGNOSTIC_REFUSAL",
      title: "Acute Symptom Emergency Redirection",
      desc: "Identifies alarm symptoms like coughing up blood (hemoptysis) and directs to emergency care.",
      badge: "Urgent Care",
    },
    {
      code: "CLARIFICATION_REQUIRED",
      title: "Ambiguity & Parameter Extraction",
      desc: "Detects underspecified queries and prompts for age, pack-years, and smoking status.",
      badge: "Guidance",
    },
    {
      code: "INSUFFICIENT_EVIDENCE",
      title: "Gatekeeper Threshold (tau = 0.28)",
      desc: "Queries with score < 0.28 trigger a transparent refusal to prevent hallucinations.",
      badge: "Zero Hallucination",
    },
  ];

  const techStack = [
    { category: "Frontend", tech: "React 18 + TypeScript + Tailwind CSS + Vite", detail: "Dual-panel Q&A workspace with dark mode support and live citation inspection." },
    { category: "Backend API", tech: "Python 3.11 + FastAPI + Pydantic v2", detail: "Asynchronous REST API with strict schema validation and error boundaries." },
    { category: "LLM & Grounding", tech: "Google Gemini 2.5 Flash", detail: "Structured evidence-grounded answers with numbered citation markers [1], [2]." },
    { category: "Embeddings", tech: "Google Gemini Embedding-001", detail: "768-dimensional semantic vector embeddings for guideline passages." },
    { category: "Vector Store", tech: "ChromaDB (Persistent)", detail: "HNSW cosine similarity index preserving document, section, and page metadata." },
    { category: "Evaluation Suite", tech: "Pytest (9 Test Suites, 100% Pass Rate)", detail: "3-tier automated evaluation testing retrieval precision, guardrails, and multi-guideline logic." },
  ];

  return (
    <main className="bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-5 py-14 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:border-teal-400/30 dark:bg-teal-950/60 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
              System Architecture & Methodology
            </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
            How <span className="text-teal-600 dark:text-teal-400">LungGuide AI</span> Operates
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            LungGuide AI combines clinical Retrieval-Augmented Generation (RAG) with a deterministic multi-tier guardrail system. Every answer is directly grounded in retrieved guideline passages with page-level citations.
          </p>
        </div>
      </div>
      </section>

      {/* System Architecture Flowchart (User Blueprint) */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">System Architecture</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            End-to-End Clinical Retrieval &amp; Verification Flow
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive system flowchart illustrating input guardrail routing, guideline ingestion, hybrid vector retrieval, confidence thresholding, and grounded dual-panel response synthesis.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
          <div className="mx-auto min-w-[820px] max-w-4xl font-sans text-xs">
            {/* Level 1: User Query / Prompt */}
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-slate-400 bg-slate-50 px-8 py-2.5 font-bold text-slate-800 shadow-sm transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                User Query / Prompt
              </div>
              <div className="h-6 w-0.5 bg-slate-400 dark:bg-slate-600" />
              <div className="text-[10px] text-slate-400 dark:text-slate-500">▼</div>
            </div>

            {/* Level 2: Input Guardrails & Safety Filter */}
            <div className="mt-1 flex flex-col items-center">
              <div className="w-84 rounded-xl border-2 border-slate-500 bg-white p-3 text-center font-bold text-slate-900 shadow-md transition dark:border-slate-500 dark:bg-slate-800 dark:text-white">
                <span className="mr-1.5 text-teal-600 dark:text-teal-400">🛡️</span>
                Input Guardrails &amp; Safety Filter
              </div>
            </div>

            {/* Level 3: 4 Guardrail Branches */}
            <div className="relative mt-2">
              <div className="mx-auto h-0.5 w-[92%] bg-slate-300 dark:bg-slate-700" />

              <div className="grid grid-cols-4 gap-3 pt-2 text-center">
                {/* Branch 1: Out of Scope */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-amber-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                    Out of Scope: Treatment/Diagnosis/General
                  </span>
                  <div className="w-full rounded-xl border border-amber-300 bg-amber-50/80 p-3 font-semibold text-amber-900 shadow-sm transition dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                    Safe Refusal &amp; Medical Disclaimer
                    <p className="mt-1 text-[10px] font-normal text-amber-700 dark:text-amber-400">
                      Redirects chemotherapy &amp; acute symptoms to oncologist / emergency care
                    </p>
                  </div>
                </div>

                {/* Branch 2: Adversarial */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-rose-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-rose-900 dark:bg-rose-950/80 dark:text-rose-300">
                    Adversarial / Injection Attack
                  </span>
                  <div className="w-full rounded-xl border border-rose-300 bg-rose-50/80 p-3 font-semibold text-rose-900 shadow-sm transition dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                    Security Block &amp; Jailbreak Alert
                    <p className="mt-1 text-[10px] font-normal text-rose-700 dark:text-rose-400">
                      Blocks DAN mode, roleplay override &amp; instruction bypass
                    </p>
                  </div>
                </div>

                {/* Branch 3: Ambiguous Query */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-blue-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-blue-900 dark:bg-blue-950/80 dark:text-blue-300">
                    Ambiguous Query
                  </span>
                  <div className="w-full rounded-xl border border-blue-300 bg-blue-50/80 p-3 font-semibold text-blue-900 shadow-sm transition dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
                    Clarification Prompt / Missing Criteria Request
                    <p className="mt-1 text-[10px] font-normal text-blue-700 dark:text-blue-400">
                      Prompts for missing Age, Pack-Years, and Smoking Status
                    </p>
                  </div>
                </div>

                {/* Branch 4: In-Scope Screening Query */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-emerald-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300">
                    In Scope Screening Query
                  </span>
                  <div className="w-full rounded-xl border-2 border-teal-500 bg-teal-50/90 p-3 font-bold text-teal-950 shadow-md transition dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-100">
                    Query Preprocessing &amp; Intent Classifier
                    <p className="mt-1 text-[10px] font-normal text-teal-800 dark:text-teal-300">
                      Normalizes terms, filters stop-words &amp; extracts clinical entities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 4: Knowledge Base & Hybrid Retrieval Engine */}
            <div className="mt-8 grid grid-cols-12 items-center gap-4">
              <div className="col-span-8 flex flex-col items-center">
                <div className="h-6 w-0.5 bg-teal-500 dark:bg-teal-400" />
                <div className="text-[10px] text-teal-600 dark:text-teal-400">▼</div>

                <div className="w-full rounded-2xl border-2 border-teal-600 bg-white p-4 text-center shadow-lg transition dark:border-teal-500 dark:bg-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white sm:text-sm">
                    Hybrid Retrieval Engine: Dense Semantic + BM25 Lexical
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Google Gemini Embedding-001 (768-d) + ChromaDB Cosine Indexing (Top-5 Chunks)
                  </p>
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center">
                <div className="w-full rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200/70 p-3.5 text-center shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/80">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <span>🗄️</span>
                    <span>Authoritative Clinical Knowledge Base</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300">
                    USPSTF (JAMA 962–970), ACS 2023, NCCN, CHEST, CMS
                  </p>
                </div>
                <div className="h-3 w-0.5 bg-slate-400 dark:bg-slate-600" />
                <div className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-center text-[11px] font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Pre-indexed &amp; Chunked Guidelines with Citations
                </div>
                <div className="h-3 w-0.5 bg-teal-500 dark:bg-teal-400" />
                <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">◀─── Ingests &amp; Embeds</div>
              </div>
            </div>

            {/* Level 5: Cross-Relevance Scoring & Threshold Evaluation */}
            <div className="mt-6 flex flex-col items-center">
              <div className="h-6 w-0.5 bg-teal-500 dark:bg-teal-400" />
              <div className="text-[10px] text-teal-600 dark:text-teal-400">▼</div>
              <div className="w-full max-w-xl rounded-2xl border-2 border-indigo-400 bg-white p-3.5 text-center font-bold text-indigo-950 shadow-md transition dark:border-indigo-500 dark:bg-slate-800 dark:text-indigo-200">
                Cross-Relevance Scoring &amp; Threshold Evaluation (τ = 0.28)
              </div>
            </div>

            {/* Level 6: 2 Threshold Branches */}
            <div className="relative mt-2">
              <div className="mx-auto h-0.5 w-[70%] bg-slate-300 dark:bg-slate-700" />

              <div className="grid grid-cols-2 gap-8 pt-2">
                {/* Left Branch: Score < Threshold */}
                <div className="flex flex-col items-center text-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                    Similarity Score &lt; Threshold / Zero Relevance
                  </span>
                  <div className="w-full rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 font-semibold text-rose-900 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    Insufficient Evidence Refusal Handler
                    <p className="mt-1 text-[10px] font-normal text-rose-700 dark:text-rose-400">
                      Transparent refusal with scoring metrics to guarantee zero hallucination
                    </p>
                  </div>
                </div>

                {/* Right Branch: Evidence Passes */}
                <div className="flex flex-col items-center text-center">
                  <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <span className="mb-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Evidence Passes Confidence Threshold (τ ≥ 0.28)
                  </span>
                  <div className="w-full rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 p-3.5 font-bold text-emerald-950 shadow-md dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100">
                    Evidence-Grounded Generator / LLM Pipeline
                    <p className="mt-1 text-[10px] font-normal text-emerald-800 dark:text-emerald-300">
                      Google Gemini 2.5 Flash strictly bounded to retrieved context
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 7: Citation Formatter & Dual Panel */}
            <div className="mt-6 flex flex-col items-center">
              <div className="h-6 w-0.5 bg-emerald-500 dark:bg-emerald-400" />
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">▼</div>

              <div className="w-full max-w-xl rounded-2xl border border-slate-300 bg-white p-3 text-center font-bold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                Traceable Inline Citation Formatter: Doc, Section, Page, Chunk ID
              </div>

              <div className="mt-2 h-4 w-0.5 bg-slate-400 dark:bg-slate-600" />
              <div className="text-[10px] text-slate-500 dark:text-slate-400">▼</div>

              <div className="w-full max-w-md rounded-xl border-2 border-teal-600 bg-teal-600 p-2.5 text-center font-bold text-white shadow-lg dark:border-teal-500 dark:bg-teal-600">
                Dual-Panel Response View
              </div>
            </div>

            {/* Level 8: Dual Outputs */}
            <div className="relative mt-2">
              <div className="mx-auto h-0.5 w-[75%] bg-teal-400 dark:bg-teal-600" />

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col items-center text-center">
                  <div className="h-4 w-0.5 bg-teal-400 dark:bg-teal-600" />
                  <div className="w-full rounded-2xl border-2 border-teal-500 bg-white p-4 font-bold text-teal-950 shadow-md dark:border-teal-400 dark:bg-slate-800 dark:text-teal-200">
                    <span className="block text-sm">💬 Grounded Answer with Interactive Citation Badges</span>
                    <span className="mt-1 block text-[11px] font-normal text-slate-600 dark:text-slate-300">
                      Numbered inline citation markers <span className="rounded bg-teal-100 px-1 font-bold text-teal-800 dark:bg-teal-900 dark:text-teal-200">[1]</span>, <span className="rounded bg-teal-100 px-1 font-bold text-teal-800 dark:bg-teal-900 dark:text-teal-200">[2]</span> mapping directly to retrieved guideline passages
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-4 w-0.5 bg-teal-400 dark:bg-teal-600" />
                  <div className="w-full rounded-2xl border-2 border-teal-500 bg-white p-4 font-bold text-teal-950 shadow-md dark:border-teal-400 dark:bg-slate-800 dark:text-teal-200">
                    <span className="block text-sm">🔍 Evidence Transparency Inspector</span>
                    <span className="mt-1 block text-[11px] font-normal text-slate-600 dark:text-slate-300">
                      Displays live similarity scores, metadata breakdown (document, section, page), and highlighted guideline excerpts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guardrails */}
      <section className="border-y border-slate-200 bg-white py-14 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">Safety & Guardrails</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Multi-Tier Clinical Scope Guardrails
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Designed to fail safely: off-scope questions, acute symptoms, prompt injections, and low-evidence queries receive structured refusals.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guardrails.map((g) => (
              <div
                key={g.code}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
                    {g.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{g.title}</h3>
                <code className="mt-1 block text-[10px] font-semibold text-teal-700 dark:text-teal-400">{g.code}</code>
                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Guideline Logic */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">Guideline Intelligence</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Multi-Guideline Logic: USPSTF 2021 vs. ACS 2023 Update
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            LungGuide AI understands and contrasts the nuanced differences between major clinical guidelines.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Parameter</th>
                  <th className="px-5 py-3.5">USPSTF (2021 Recommendation)</th>
                  <th className="px-5 py-3.5">ACS (2023 Updated Guideline)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Age Range</td>
                  <td className="px-5 py-3">50 to 80 years</td>
                  <td className="px-5 py-3">50 to 80 years</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Pack-Year History</td>
                  <td className="px-5 py-3">20 or more pack-years</td>
                  <td className="px-5 py-3">20 or more pack-years</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Years Since Quitting</td>
                  <td className="px-5 py-3 text-rose-600 dark:text-rose-400 font-medium">Must have quit within past 15 years</td>
                  <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400 font-medium">Eliminated quit duration (eligible regardless of years quit)</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Example: Quit 18 Years Ago</td>
                  <td className="px-5 py-3"><span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">Ineligible (15-yr cutoff)</span></td>
                  <td className="px-5 py-3"><span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">Eligible (ACS 2023 update)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-slate-200 bg-white py-14 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">Technologies & Tools</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Tools and Frameworks Used
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((item) => (
              <article
                key={item.category}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">{item.category}</span>
                <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{item.tech}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-teal-100 bg-teal-50 p-8 text-center dark:border-teal-900/50 dark:bg-teal-950/30">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Ready to test the system?</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600 dark:text-slate-300">
              Explore our live evidence retrieval panel, citation cards, and confidence metrics.
            </p>
            <button
              onClick={() => onNavigate("ask")}
              className="mt-6 inline-flex rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 dark:bg-teal-500 dark:text-teal-950 dark:hover:bg-teal-400"
            >
              Open Q&A Workspace
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
