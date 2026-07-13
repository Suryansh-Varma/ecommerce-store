'use client';

import dynamic from 'next/dynamic';

// Lazy-load AIChat in a client component wrapper
// This avoids the "ssr: false not allowed in Server Components" error
const AIChat = dynamic(() => import('./AIChat'), { ssr: false });

export default function AIChatClientWrapper() {
  return <AIChat />;
}
