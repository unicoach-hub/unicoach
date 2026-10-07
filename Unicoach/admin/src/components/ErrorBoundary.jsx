import React from 'react';

/**
 * Enterprise Admin Portal Error Boundary
 * Prevents admin dashboard crashes and displays a clean recovery state.
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
    console.error('⚠️ Admin Portal Render Error:', error, errorInfo);
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-2xl text-amber-400">
              ⚠️
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">
                Admin View Error
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected error occurred while rendering this admin view. All underlying database records remain unaffected.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Refresh View
              </button>
              <button
                onClick={this.handleGoDashboard}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 transition cursor-pointer"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
