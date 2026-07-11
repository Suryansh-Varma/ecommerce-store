// ============================================================
// authService.ts
// ============================================================
// WHY: Centralizes all authentication API calls in one place.
// Replaces:
//   - src/app/api/auth/signup/route.ts (Next.js API route deleted)
//   - src/app/api/auth/[...nextauth]/route.ts (NextAuth handler deleted)
//   - The direct fetch('/api/auth/signup') in signup/page.tsx
//   - The signIn('credentials', {...}) from next-auth/react in signin/page.tsx
// ============================================================

import axiosClient, { unwrapResponse } from './axiosClient';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from '@/types/auth.types';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await axiosClient.post<unknown>('/users/login', payload);
  return unwrapResponse<LoginResponse>(response.data);
}

// ─── REGISTER ─────────────────────────────────────────────────
// POST /users/register
// Spring Boot creates the user (BCrypt-hashed password).
// We redirect to /login after success — user must sign in explicitly.
export async function register(payload: RegisterPayload): Promise<void> {
  await axiosClient.post('/users/register', payload);
}

// ─── DECODE JWT ───────────────────────────────────────────────
// We parse the JWT payload to extract user info (id, name, email)
// WITHOUT making a round-trip to the server.
// Spring Boot JWTs are base64url encoded: header.payload.signature
// We only decode the payload — we don't verify the signature here
// (Spring Boot already verified it when issuing the token).
export function decodeToken(token: string): User | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    // atob decodes base64 — replace URL-safe chars first
    const decoded = JSON.parse(
      atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    );

    // Adapt this based on what your Spring Boot JWT actually contains.
    // Common fields: sub (email), userId, name, exp
    return {
      id: decoded.userId ?? decoded.id ?? 0,
      email: decoded.sub ?? decoded.email ?? '',
      name: decoded.name ?? decoded.sub ?? 'User',
    };
  } catch {
    return null;
  }
}

// ─── CHECK TOKEN EXPIRY ───────────────────────────────────────
// Returns true if the token is still valid (not expired).
export function isTokenValid(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    const decoded = JSON.parse(
      atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    );
    // exp is Unix timestamp in seconds
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
