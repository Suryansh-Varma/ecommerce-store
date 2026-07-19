'use client';

// ============================================================
// AuthContext.tsx
// ============================================================
// WHY: This is the single replacement for ALL of NextAuth:
//   - Replaces SessionProvider (src/app/provider.tsx → DELETED)
//   - Replaces useSession() hook across all pages
//   - Replaces getServerSession() in layout.tsx
//   - Replaces signIn() / signOut() in Navbar, dashboard, product page
//
// HOW IT WORKS:
//   1. On mount, reads token from localStorage and validates expiry.
//   2. login() calls Spring Boot, stores token, decodes user from JWT.
//   3. logout() clears localStorage and redirects to /login.
//   4. All child components access auth state via useAuth() hook.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService';
import type { User, LoginPayload } from '@/types/auth.types';

// ─── CONTEXT SHAPE ────────────────────────────────────────────
interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;           // true while checkAuth() runs on mount
  login: (payload: LoginPayload, redirectUrl?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;        // exposed for ProtectedRoute to call
}

// ─── CONTEXT CREATION ─────────────────────────────────────────
export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (payload, redirectUrl) => {},
  logout: () => {},
  checkAuth: () => {},
});

// ─── STORAGE KEYS ─────────────────────────────────────────────
// Centralised constants — prevents typo bugs across files
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ─── PROVIDER ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── CHECK AUTH ─────────────────────────────────────────────
  // Runs on mount. Reads token from localStorage and restores session
  // if the token is still valid. This replaces getServerSession().
  const checkAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && authService.isTokenValid(storedToken) && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        // Token missing or expired — clear stale data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      // If localStorage is unavailable (e.g., SSR edge), fail silently
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run checkAuth on first render (client-side only)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── LOGIN ──────────────────────────────────────────────────
  // Calls Spring Boot, stores token + decoded user, updates state.
  // Replaces: signIn('credentials', { email, password, callbackUrl: '/' })
  const login = useCallback(async (payload: LoginPayload, redirectUrl?: string) => {
  const response = await authService.login(payload);

  const user = {
    id: response.id,
    name: response.name,
    email: response.email,
  };

  localStorage.setItem(TOKEN_KEY, response.token);
  document.cookie = `auth_token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  setToken(response.token);
  setUser(user);
  setIsAuthenticated(true);

  router.push(redirectUrl || "/");
}, [router]);

  // ── LOGOUT ─────────────────────────────────────────────────
  // Clears all auth state and redirects to /login.
  // Replaces: signOut({ callbackUrl: '/auth/signin' })
const logout = useCallback(() => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Delete auth cookie
  document.cookie =
    "auth_token=; Path=/; Max-Age=0; SameSite=Lax";

  setToken(null);
  setUser(null);
  setIsAuthenticated(false);

  router.replace("/login");
}, [router]);

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── INTERNAL HOOK (for hook file to re-export) ───────────────
// Exported here too for convenience — the useAuth.ts file wraps this.
export function useAuthContext(): AuthContextType {
  return useContext(AuthContext);
}
