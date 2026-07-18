// Replaces the old useAuth stub that always returned `user: null`.
//
// Usage:
//   1. Wrap the app once in <AuthProvider> (see main.tsx / App.tsx root).
//   2. Anywhere else, call const { user, login, register, logout } = useAuth();
//
// Talks to the real endpoints already implemented on the server:
//   POST /auth/register  { email, password, name, locale? }
//   POST /auth/login     { email, password }
//   POST /auth/refresh   { refreshToken }   (handled automatically by apiClient)
//   POST /auth/logout    { refreshToken }

import * as React from 'react';
import {
  apiFetch,
  AUTH_LOGOUT_EVENT,
  AuthTokens,
  AuthUser,
  clearTokens,
  clearUser,
  getStoredTokens,
  getStoredUser,
  storeTokens,
  storeUser,
} from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  locale?: 'ar' | 'en' | 'tr';
}

export interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True only during the initial localStorage hydration on mount. */
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const tokens = getStoredTokens();
    const cachedUser = getStoredUser();
    if (tokens && cachedUser) {
      setUser(cachedUser);
    }
    setIsLoading(false);

    // apiClient dispatches this if a background token refresh fails
    // (e.g. refresh token expired) so every tab/component drops the session.
    const onForcedLogout = () => setUser(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, []);

  const login = React.useCallback(
    async ({ email, password }: LoginInput) => {
      try {
        const res = await apiFetch<AuthResponse>('/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email, password }),
        });
        storeTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
        storeUser(res.user);
        setUser(res.user);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'تعذر تسجيل الدخول',
          description: err instanceof Error ? err.message : 'حدث خطأ غير متوقع',
        });
        throw err;
      }
    },
    [toast],
  );

  const register = React.useCallback(
    async (input: RegisterInput) => {
      try {
        const res = await apiFetch<AuthResponse>('/auth/register', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify(input),
        });
        storeTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
        storeUser(res.user);
        setUser(res.user);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'تعذر إنشاء الحساب',
          description: err instanceof Error ? err.message : 'حدث خطأ غير متوقع',
        });
        throw err;
      }
    },
    [toast],
  );

  const logout = React.useCallback(async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.refreshToken) {
        // Best-effort server-side revocation; local session is cleared
        // in `finally` regardless of whether this call succeeds.
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch {
      // Ignore network errors — we still want to log the user out locally.
    } finally {
      clearTokens();
      clearUser();
      setUser(null);
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
