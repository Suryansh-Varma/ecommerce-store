'use client';

// ============================================================
// ProtectedRoute.tsx
// ============================================================
// WHY: A client-side guard for pages that need authentication.
// Works in tandem with the middleware (which does server-side checks).
// The double-check prevents a flash of content if middleware is bypassed
// (e.g., when JavaScript navigates client-side without a full page reload).
//
// USAGE:
//   Wrap the JSX of a protected page:
//   <ProtectedRoute>
//     <YourPageContent />
//   </ProtectedRoute>
//
// BEHAVIOUR:
//   - While auth is loading (first paint): shows a spinner
//   - Not authenticated: redirects to /login
//   - Authenticated: renders children normally
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show a minimal spinner while auth state is being restored from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — return null while redirect fires
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated — render the page
  return <>{children}</>;
}
