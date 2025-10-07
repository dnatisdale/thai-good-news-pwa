// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <pre className="p-3 bg-neutral-100 dark:bg-neutral-800 overflow-auto rounded">
{String(this.state.error)}
          </pre>
          <p className="mt-2 opacity-70">Try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
