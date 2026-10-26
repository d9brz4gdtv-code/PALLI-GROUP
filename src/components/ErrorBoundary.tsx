import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: unknown): State {
    let msg = 'An unexpected error occurred';
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === 'string') {
      msg = error;
    }
    return { hasError: true, errorMessage: msg };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Component Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">সমস্যা দেখা দিয়েছে</h2>
            <p className="text-sm text-gray-500 mb-6">
              অ্যাপটি পুনরায় লোড করতে নিচের বাটনে চাপ দিন।
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full bg-[#3B55A4] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#2D4280] transition-all shadow-lg shadow-[#3B55A4]/20"
            >
              রিলোড করুন (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
