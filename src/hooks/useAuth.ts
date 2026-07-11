// ============================================================
// useAuth.ts
// ============================================================
// WHY: Provides a clean, ergonomic API for consuming AuthContext.
//
// BEFORE (NextAuth):
//   import { useSession, signIn, signOut } from 'next-auth/react';
//   const { data: session } = useSession();
//   session?.user?.name
//
// AFTER (this hook):
//   import { useAuth } from '@/hooks/useAuth';
//   const auth = useAuth();
//   auth.user?.name
//   auth.login({ email, password })
//   auth.logout()
//   auth.isAuthenticated
//
// This is the ONE import that replaces next-auth/react in every component.
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Did you wrap your app with <AuthProvider>?');
  }

  return context;
}
