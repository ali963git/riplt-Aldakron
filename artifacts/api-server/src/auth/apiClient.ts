// Thin fetch wrapper for the NestJS API server.
//
// Handles:
//  - attaching the JWT access token to every request
//  - transparently refreshing an expired access token on a 401
//    (single in-flight refresh even if several requests 401 at once)
//  - persisting tokens + the last-known user object in localStorage
//  - surfacing backend error messages (NestJS returns { message, statusCode })
//
// There is currently no GET /auth/me endpoint on the server, so the user
// object shown in the UI is whatever came back from the last /auth/login,
// /auth/register response — it is cached in localStorage and trusted until
// logout or a failed refresh clears it. If you add a /auth/me endpoint later,
// call it once on app start instead of relying on the cache.

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  locale: string;
  isActive: boolean;
  [key: string]: unknown;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';
const TOKENS_KEY = 'azkar_auth_tokens';
const USER_KEY = 'azkar_auth_user';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function getStoredTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(TOKENS_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/** Fired when the session is fully invalidated (refresh failed), so
 * AuthProvider (or anything else) can react without a circular import. */
export const AUTH_LOGOUT_EVENT = 'azkar:auth-logout';

function forceLogout() {
  clearTokens();
  clearUser();
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function performRefresh(): Promise<AuthTokens | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) return null;
    const newTokens = (await res.json()) as AuthTokens;
    storeTokens(newTokens);
    return newTokens;
  } catch {
    return null;
  }
}

/** De-dupes concurrent refresh attempts: if five requests 401 at the same
 * moment, only one /auth/refresh call goes out and the rest await it. */
function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

interface ApiFetchOptions extends RequestInit {
  /** Skip attaching the Authorization header (login/register/refresh). */
  skipAuth?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retried?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, _retried, headers, ...rest } = options;
  const tokens = getStoredTokens();

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(tokens?.accessToken && !skipAuth
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {}),
      ...headers,
    },
  });

  if (res.status === 401 && !skipAuth && !_retried) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    forceLogout();
    throw new ApiError(401, 'انتهت الجلسة، الرجاء تسجيل الدخول مرة أخرى');
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const rawMessage = (body as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
    throw new ApiError(res.status, message ?? 'حدث خطأ غير متوقع');
  }

  return body as T;
}
