import React from 'react';
import { ArrowRight, Megaphone, RotateCw } from 'lucide-react';

/**
 * Global error boundary: catches render errors so the visitor never sees a blank screen.
 * The fallback is a desi railway "train is late" announcement at UniCoach Junction,
 * drawn inline (no other UI components) so it still renders when something else broke.
 */
const INK = '#16130F';
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
        <div className="min-h-screen bg-[#F6F3EC] text-[#16130F] flex items-start sm:items-center justify-center px-4 pt-[150px] sm:pt-[112px] pb-16">
          <div className="w-full max-w-[640px]">
            {/* Station board on two posts */}
            <div className="flex flex-col items-center">
              <div className="px-8 sm:px-10 py-3 bg-[#F6C944] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] text-center" style={{ borderRadius: 8 }}>
                <span className="block font-['Rozha_One',serif] text-[26px] sm:text-[30px] leading-none">यूनिकोच जंक्शन</span>
                <span className="block mt-1.5 font-['Anton',sans-serif] tracking-[0.18em] text-[14px] sm:text-[16px] leading-none">UNICOACH JN.</span>
              </div>
              <div className="flex gap-28 sm:gap-36" aria-hidden="true">
                <span className="block w-1.5 h-7 bg-[#16130F]" />
                <span className="block w-1.5 h-7 bg-[#16130F]" />
              </div>
            </div>

            {/* The announcement */}
            <div className="bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-6 sm:p-8" style={{ borderRadius: 16 }}>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-[#D0362E] text-white grid place-items-center shrink-0 border-[2.5px] border-[#16130F]">
                  <Megaphone size={18} />
                </span>
                <div>
                  <p className="font-['Rozha_One',serif] text-[20px] sm:text-[22px] leading-none text-[#D0362E]">यात्रीगण कृपया ध्यान दें</p>
                  <p className="mt-1.5 text-[11.5px] font-bold tracking-[0.14em] text-[#6B6458]">KIND ATTENTION, PLEASE</p>
                </div>
              </div>

              <h1 className="mt-6 font-urbanist font-black text-[30px] sm:text-[40px] leading-[1.04] tracking-[-0.03em]">Is page ki gaadi thodi late hai</h1>
              <p className="mt-3 text-[15.5px] sm:text-[16.5px] leading-relaxed text-[#4A443B]">
                Kuch load nahi ho paaya. Aapka saved data aur shortlist bilkul safe hai. Ek baar dobara try karo.
              </p>

              {/* Departures board (a grid, not a table: global table styles force grey text) */}
              <div role="table" aria-label="Departures" className="mt-6 rounded-xl bg-[#16130F] font-['Khand',sans-serif] overflow-hidden">
                <div role="row" className="grid grid-cols-[1.4fr_0.7fr_0.8fr] text-[12.5px] tracking-wide text-[#B9B2A6] border-b border-white/10">
                  {['Gaadi / Train', 'Platform', 'Status'].map((h) => <span key={h} role="columnheader" className="px-4 py-2 font-semibold">{h}</span>)}
                </div>
                <div role="row" className="grid grid-cols-[1.4fr_0.7fr_0.8fr] items-center text-[17px] sm:text-[18px]">
                  <span role="cell" className="px-4 py-2.5 font-bold text-[#F2B705]">Page Express</span>
                  <span role="cell" className="px-4 py-2.5 font-semibold text-white">1</span>
                  <span role="cell" className="px-4 py-2.5 font-bold text-[#FF6B5E] animate-pulse">LATE</span>
                </div>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="no-shine inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#DE5C2B] text-white text-[15px] font-bold border-[2.5px] border-[#16130F] shadow-[3px_3px_0_#16130F] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#16130F] transition-all cursor-pointer"
                >
                  <RotateCw size={16} strokeWidth={2.5} /> Dobara try karo
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="no-shine inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-[15px] font-bold border-[2.5px] border-[#16130F] shadow-[3px_3px_0_#16130F] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#16130F] transition-all cursor-pointer"
                  style={{ color: INK }}
                >
                  Home station chalo <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>

              <p className="mt-6 pt-4 border-t-2 border-dashed border-[#16130F]/20 text-center font-['Rozha_One',serif] text-[17px] text-[#6B6458]">असुविधा के लिए खेद है।</p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left bg-[#FAF8F4] border border-[#16130F]/10 rounded-xl p-3 text-xs text-rose-700 overflow-auto max-h-40">
                  <summary className="cursor-pointer font-bold text-slate-600 select-none">
                    Debug details (developer view)
                  </summary>
                  <pre className="mt-2 text-[11px] whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
