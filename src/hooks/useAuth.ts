import { useAuthStore } from '@/stores/authStore';

/** Convenience hook around the auth store. */
export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
    error: s.error,
    login: s.login,
    signup: s.signup,
    logout: s.logout,
    clearError: s.clearError,
  }));
}
