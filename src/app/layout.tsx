// ============================================================
// layout.tsx — Root Layout
// ============================================================
// CHANGES MADE:
//   REMOVED: import { getServerSession } from 'next-auth'    ← NextAuth dependency
//   REMOVED: import Providers from './provider'               ← NextAuth SessionProvider wrapper
//   REMOVED: import { authOptions } from '@/lib/auth'        ← NextAuth config
//   REMOVED: const session = await getServerSession(...)     ← Server-side session fetch
//   REMOVED: <Providers session={session}>                   ← NextAuth provider
//
//   ADDED:   import { AuthProvider } from '@/context/AuthContext'
//   ADDED:   <AuthProvider>                                   ← Our JWT-based auth provider
//
// WHY: The old layout fetched the session server-side (blocking) and passed it to
// SessionProvider as a prop. Our AuthProvider is a client component that reads
// the JWT from localStorage on mount — no server round-trip needed.
// This makes the layout a pure Server Component again (no async needed).
//
//   ADDED:   <AIChatWidget />                                ← TechHeaven AI floating widget
// ============================================================

import { AuthProvider } from '@/context/AuthContext';
import AIChatWrapper from '@/components/AIChat/AIChatWrapper';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#2563EB" showSpinner={false} />
        <AuthProvider>
          {children}
          <AIChatWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}