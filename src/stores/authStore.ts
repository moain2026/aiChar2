import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthSession, LoginCredentials, SignupCredentials, User } from '@/types';
import { mockLogin, mockLogout, mockSignup } from '@/services/mockApi';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Validate the persisted session on app boot. */
  hydrate: () => void;
}

function applySession(session: AuthSession): Partial<AuthState> {
  return {
    user: session.user,
    token: session.token,
    expiresAt: session.expiresAt,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      async login(credentials) {
        set({ isLoading: true, error: null });
        try {
          const session = await mockLogin(credentials);
          set(applySession(session));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      async signup(credentials) {
        set({ isLoading: true, error: null });
        try {
          const session = await mockSignup(credentials);
          set(applySession(session));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Signup failed';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      async logout() {
        await mockLogout();
        set({
          user: null,
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError() {
        set({ error: null });
      },

      hydrate() {
        const { expiresAt, user, token } = get();
        if (!user || !token) return;
        if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
          set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
          return;
        }
        set({ isAuthenticated: true });
      },
    }),
    {
      name: STORAGE_KEYS.authSession,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
      }),
    },
  ),
);
