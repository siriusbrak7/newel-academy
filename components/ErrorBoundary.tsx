import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                    <div className="glass border border-red-500/20 rounded-3xl p-10 max-w-lg w-full space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="text-red-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {this.props.fallbackTitle || 'Something went wrong'}
                        </h2>
                        <p className="text-white/50 text-sm leading-relaxed">
                            An unexpected error occurred in this section. You can try reloading it below, or navigate to a different page.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-32 text-left">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-4 justify-center pt-2">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all active:scale-95"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.assign('/')}
                                className="px-6 py-3 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Go Home
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
