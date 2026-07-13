'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?from=/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    axiosClient.get('/admin/dashboard')
      .then(() => {
        setIsAdmin(true);
        setVerifying(false);
      })
      .catch((error) => {
        console.error('Verifying admin privileges failed:', error);
        setErrorMsg(error?.response?.data?.message || error?.message || 'Unknown error');
        setIsAdmin(false);
        setVerifying(false);
      });
  }, [isAuthenticated]);

  if (isLoading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 mx-auto">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Access Denied</h1>
          <p className="text-sm text-slate-500 font-sans">
            You do not have administrative permissions to view this section.
          </p>
          {errorMsg && (
            <p className="text-xs text-red-500 font-mono bg-red-50 p-2 rounded border border-red-100">
              Error details: {errorMsg}
            </p>
          )}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors font-sans"
            >
              Go to Home Catalog
            </button>
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors font-sans"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
