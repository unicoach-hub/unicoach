import React from 'react';

/**
 * Enterprise-Grade Global Error Boundary for UniCoach Web App
 * Prevents "White Screen of Death" by catching runtime render errors
 * and offering graceful recovery actions.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('⚠️ UniCoach Application Caught Runtime Render Error:', error, errorInfo);

    // Auto-reload on deployment chunk mismatch so user doesn't get stuck on old bundle
    const errorMsg = error?.message || '';
    const isChunkMismatch = 
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('error loading dynamically imported module') ||
      error?.name === 'ChunkLoadError';

    if (isChunkMismatch) {
      const alreadyTried = sessionStorage.getItem('chunk_reload_done');
      if (!alreadyTried) {
        sessionStorage.setItem('chunk_reload_done', 'true');
        window.location.reload();
        return;
      }
    }
    
    // Sentry client capture if initialized
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-3xl text-indigo-400 shadow-inner">
              🎓
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full tracking-wider uppercase">
                System Recovery
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Something didn't load properly
              </h1>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                We encountered an unexpected rendering hiccup on this page. Your saved data and shortlists are safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:from-[#C04A1D] hover:to-[#A73D14] text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                ↻ Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-2xl border border-slate-600/60 transition-all cursor-pointer"
              >
                ⌂ Back to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-rose-300 overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-400 select-none">
                  Debug Details (Developer View)
                </summary>
                <pre className="mt-2 text-[11px] whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
