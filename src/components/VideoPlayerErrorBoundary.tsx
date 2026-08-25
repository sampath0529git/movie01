import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallbackUrl?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class VideoPlayerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Video Player Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center border border-brand-500/30 rounded-xl z-[9999]">
          <p className="text-brand-400 font-bold mb-2">Video Player Error</p>
          <p className="text-xs text-gray-300 mb-2">We encountered a problem loading the advanced player. Loading native fallback...</p>
          {this.props.fallbackUrl ? (
            <video
              src={this.props.fallbackUrl}
              className="w-full h-full border-0 bg-black mt-2 rounded"
              controls
              autoPlay
            />
          ) : (
             <p className="text-sm text-gray-500">No fallback available.</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
