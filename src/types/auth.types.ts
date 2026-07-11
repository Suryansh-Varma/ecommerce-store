// ============================================================
// Auth Types
// Replaces: src/types/next-auth.d.ts (NextAuth augmentation)
// Used by: AuthContext, authService, useAuth, Navbar, pages
// ============================================================

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Spring Boot returns { token: "JWT_TOKEN" } on login
export interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
}

// Decoded JWT payload structure (subset we care about)
export interface JwtPayload {
  sub: string;       // email (Spring Boot default subject)
  userId?: number;   // if Spring Boot includes it
  name?: string;
  exp: number;       // expiry timestamp
  iat: number;       // issued-at timestamp
}
