// Compatibility shim.
//
// The rest of the app (App.tsx etc.) was written against the old Firebase-era
// shape: `{ user: { uid, displayName, photoURL }, loading, loginWithGoogle, logout }`.
// That old provider was a no-op stub — `user` was always null and
// loginWithGoogle/logout did nothing.
//
// This file keeps that exact shape so nothing else needs to change, but wires
// it to the real JWT auth in `./lib/useAuth` underneath. It also re-exports
// `login` / `register` (real email+password auth) for new code to use directly
// instead of the old shape.
//
// If you're writing new code, prefer importing from `./lib/useAuth` directly
// and using the `AuthUser` shape (`id`, `name`, ...) instead of this shim.

import React from 'react';
import {
  AuthProvider as RealAuthProvider,
  useAuth as useRealAuth,
} from './lib/useAuth';

export { RealAuthProvider as AuthProvider };

interface SimpleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  /** Real email+password login — prefer this over loginWithGoogle going forward. */
  login: (input: { email: string; password: string }) => Promise<void>;
  /** Real email+password registration. */
  register: (input: {
    email: string;
    password: string;
    name: string;
    locale?: 'ar' | 'en' | 'tr';
  }) => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const real = useRealAuth();

  const user: SimpleUser | null = real.user
    ? {
        uid: real.user.id,
        email: real.user.email,
        displayName: real.user.name,
        photoURL: null,
      }
    : null;

  const loginWithGoogle = async () => {
    // Google sign-in was never implemented (same as the old stub) — this
    // keeps existing call sites from crashing. Use `login`/`register` for
    // real email+password auth instead.
    console.warn('loginWithGoogle is not implemented. Use login()/register() instead.');
  };

  return {
    user,
    loading: real.isLoading,
    loginWithGoogle,
    logout: real.logout,
    login: real.login,
    register: real.register,
  };
};
