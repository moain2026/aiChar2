import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Top-level React error boundary. Catches render-time exceptions
 * and shows a friendly fallback page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="relative min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-500/10 text-danger-500 ring-1 ring-danger-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">
            An unexpected error occurred. You can try again — if it keeps happening,
            please let us know.
          </p>
          {this.state.error?.message && (
            <pre className="mb-6 text-left text-xs text-muted-foreground bg-muted rounded-lg p-3 overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
