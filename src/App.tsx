import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastViewport } from '@/components/ui/Toast';
import { ProtectedRoute, GuestOnlyRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES, APP_NAME } from '@/utils/constants';

// Lazy-load pages so route changes ship only what's needed.
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const DocumentsPage = lazy(() =>
  import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
);
const ChatPage = lazy(() =>
  import('@/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const TITLES: Record<string, string> = {
  [ROUTES.login]: 'Sign in',
  [ROUTES.signup]: 'Sign up',
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.documents]: 'Documents',
  [ROUTES.chat]: 'Chat',
};

function PageTitle(): null {
  const location = useLocation();
  useEffect(() => {
    const match = Object.entries(TITLES).find(([path]) =>
      location.pathname.startsWith(path),
    );
    document.title = match ? `${match[1]} · ${APP_NAME}` : APP_NAME;
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes(): JSX.Element {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path={ROUTES.login}
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path={ROUTES.signup}
            element={
              <GuestOnlyRoute>
                <SignupPage />
              </GuestOnlyRoute>
            }
          />

          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute>
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.documents}
            element={
              <ProtectedRoute>
                <AppShell>
                  <DocumentsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.chat}
            element={
              <ProtectedRoute>
                <AppShell>
                  <ChatPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={`${ROUTES.chat}/:conversationId`}
            element={
              <ProtectedRoute>
                <AppShell>
                  <ChatPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export function App(): JSX.Element {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <PageTitle />
        <AnimatedRoutes />
        <ToastViewport />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
