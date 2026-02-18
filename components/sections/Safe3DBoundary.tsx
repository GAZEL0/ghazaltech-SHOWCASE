"use client";

import React from "react";

type Props = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

// Simple error boundary to prevent 3D crashes from breaking the page.
export class Safe3DBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Log for debugging without crashing UI
    console.error("3D render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="h-full w-full rounded-2xl border border-slate-800/60 bg-slate-950/50" aria-hidden />
        )
      );
    }
    return this.props.children;
  }
}
