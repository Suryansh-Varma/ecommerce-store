'use client';

import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background text-dark min-h-screen flex flex-col justify-between">
      
      <div className="flex-grow">
        <Navbar />
        
        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white border border-borders rounded-xl shadow-sm p-8 sm:p-10 text-center space-y-6">
            
            {/* Welcome Icon Frame */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-borders text-dark mx-auto">
              <svg className="h-5.5 w-5.5 text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-bold text-dark">
                Hi, {user?.name || 'Friend'}!
              </h1>
              <p className="text-xs text-light">
                Welcome back to your dashboard. You are securely logged in.
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/orders"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                View My Orders
              </Link>
              <Link
                href="/myaccount"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-borders hover:bg-slate-50 text-dark rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
              >
                <svg className="h-4 w-4 text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                </svg>
                Manage Addresses
              </Link>
              
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-borders text-danger hover:bg-danger/5 rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign Out
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-borders py-5 text-center text-xs font-medium text-light bg-white">
        © {new Date().getFullYear()} Tech Haven. All rights reserved.
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}