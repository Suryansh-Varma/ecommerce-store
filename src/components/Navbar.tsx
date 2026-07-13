'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items) || [];
  const cartCount = cartItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-borders bg-white">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 md:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-dark">
            Tech<span className="text-primary">Haven</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
              isActive('/')
                ? 'text-dark bg-slate-50'
                : 'text-light hover:text-dark'
            }`}
          >
            Home
          </Link>
          <Link
            href="/myaccount"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
              isActive('/myaccount')
                ? 'text-dark bg-slate-50'
                : 'text-light hover:text-dark'
            }`}
          >
            Account
          </Link>
          {auth.isAuthenticated && (
            <Link
              href="/orders"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                isActive('/orders')
                  ? 'text-dark bg-slate-50'
                  : 'text-light hover:text-dark'
              }`}
            >
              Orders
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-borders transition-colors duration-150 hover:bg-slate-50 ${
              isActive('/cart') ? 'border-primary text-primary bg-slate-50' : 'text-dark'
            }`}
            aria-label="View Cart"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth State Button */}
          {auth.isAuthenticated ? (
            <button
              onClick={() => auth.logout()}
              className="flex items-center justify-center px-3.5 h-9 bg-white border border-borders text-dark hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center px-3.5 h-9 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
