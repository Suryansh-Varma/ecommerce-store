// ============================================================
// axiosClient.ts
// ============================================================
// WHY: A single, shared Axios instance guarantees that:
//   1. Every request automatically gets the Authorization header
//   2. Every 401 response automatically clears auth and redirects to /login
//   3. The base URL is configured once from an environment variable
//   4. No page or service needs to manually manage the token
//
// This replaces the scattered `fetch('/api/...')` calls across
// the old pages and the NextAuth `getSession()` calls in useCartStore.
// ============================================================

import axios from 'axios';

// Set this in .env.local → NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout — prevent hanging requests
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────
// Runs before every outgoing request.
// Reads the JWT from localStorage and attaches it as a Bearer token.
axiosClient.interceptors.request.use(
  (config) => {
    // localStorage is only available on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────
// Runs after every response.
// On 401 Unauthorized: clears the stale token and redirects to /login.
// This handles expired JWTs automatically — the user is logged out gracefully.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear stale auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login — only if not already there to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function unwrapResponse<T>(data: unknown): T {
  if (data && typeof data === 'object' && data !== null && 'success' in data && 'data' in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export default axiosClient;
