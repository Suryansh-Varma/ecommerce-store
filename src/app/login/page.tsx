'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Calls Spring Boot POST /users/login
      // Stores JWT in localStorage, updates AuthContext, redirects to /
      await login({ email, password });
    } catch (err: unknown) {
      // Axios error — Spring Boot returned 401 or 400
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-borders shadow-sm rounded-xl p-8 sm:p-10 space-y-6">
        
        {/* Brand/Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-dark text-white shadow-sm">
            <svg className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-dark">Welcome Back</h2>
            <p className="text-xs text-light">Sign in to your Tech Haven account to proceed.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] font-bold text-light uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all duration-150"
              placeholder="name@gmail.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-bold text-light uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-borders rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all duration-150"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-danger/5 border border-danger/10 text-danger text-xs font-semibold flex items-start gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in with Email'
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs font-semibold text-light border-t border-borders pt-4">
          New to Tech Haven?{' '}
          <Link
            href="/signup"
            className="text-primary hover:underline font-semibold transition-all"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
