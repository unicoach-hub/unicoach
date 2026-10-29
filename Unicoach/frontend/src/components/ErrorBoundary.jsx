import React from 'react';

import CapIcon from './ui/CapIcon';
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
        <div className="min-h-screen bg-[#F6F3EC] text-[#16130F] flex items-center justify-center p-6 select-none font-sans">
          <div className="uc-soft max-w-lg w-full rounded-3xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-white border border-[#16130F]/10 rounded-2xl flex items-center justify-center text-3xl text-[#DE5C2B]">
              <CapIcon />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-white text-[#C04A1D] text-xs font-bold rounded-full tracking-wider uppercase">
                System Recovery
              </span>
              <h1 className="text-2xl font-black tracking-tight text-[#16130F]">
                Something didn't load properly
              </h1>
              <p className="text-sm text-[#3D372F] font-medium leading-relaxed">
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
                className="px-6 py-3.5 bg-white hover:bg-[#FAF9F6] text-[#16130F] text-sm font-bold rounded-2xl border border-[#16130F]/10 transition-all cursor-pointer"
              >
                ⌂ Back to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-white border border-[#16130F]/10 rounded-xl p-3 text-xs text-rose-700 overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-600 select-none">
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
