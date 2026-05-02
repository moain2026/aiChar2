import { Spinner } from '@/components/ui/Spinner';

/**
 * Full-screen loading state used as the React.lazy / Suspense fallback.
 */
export function PageLoader(): JSX.Element {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-primary-500" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
