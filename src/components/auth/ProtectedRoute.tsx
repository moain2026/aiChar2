import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Gatekeeper for authenticated pages. Redirects unauthenticated
 * visitors to the login page while preserving the intended path.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-primary-500" />
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

/**
 * Inverse of ProtectedRoute — redirects already-authenticated
 * visitors away from auth-only pages (login/signup).
 */
export function GuestOnlyRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  return <>{children}</>;
}
