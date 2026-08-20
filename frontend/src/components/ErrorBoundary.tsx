import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("LungGuide interface error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-700">LungGuide AI</p><h1 className="mt-3 text-2xl font-bold text-slate-950">The interface needs a refresh.</h1><p className="mt-3 text-sm leading-6 text-slate-500">A browser update interrupted the page. Refreshing will safely restore the workspace.</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">Refresh LungGuide</button></div></main>;
    }
    return this.props.children;
  }
}
