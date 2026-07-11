'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import type { Product } from '@/types/product.types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background text-dark min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="mx-auto max-w-7xl px-6 md:px-8 py-8 space-y-12">
          
          {/* Hero Section - Vercel/Apple style minimalist dark card */}
          <section className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-900 py-16 px-8 md:px-12 shadow-sm text-white">
            <div className="relative max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900/50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                New Releases
              </span>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Elevate Your Tech Experience
              </h1>
              
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">
                Discover the latest innovations in high-performance gadgets and accessories. Engineered for developers, designers, and creators.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="#products"
                  className="inline-flex items-center justify-center px-4.5 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors duration-150"
                >
                  Shop the Collection
                </Link>
                <a
                  href="#footer"
                  className="inline-flex items-center justify-center px-4.5 py-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-300 text-xs font-semibold hover:bg-slate-800/50 transition-colors duration-150"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <main className="space-y-6" id="products">
            
            {/* Header & Better Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-borders pb-4">
              <div>
                <h2 className="text-lg font-bold text-dark tracking-tight">
                  Featured Products
                </h2>
                <p className="text-xs text-light font-normal mt-0.5">
                  Explore our handpicked premium gear.
                </p>
              </div>

              {/* Redesigned Search Input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-borders bg-white text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150"
                />
                <div className="absolute left-3 top-2.5 text-light">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3.5 border border-borders bg-white rounded-xl p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="w-full aspect-square bg-slate-100 animate-shimmer rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-slate-100 animate-shimmer rounded w-3/4" />
                      <div className="h-3 bg-slate-100 animate-shimmer rounded w-1/2" />
                    </div>
                    <div className="h-8 bg-slate-100 animate-shimmer rounded-lg w-full mt-1" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-3.5 rounded-lg bg-danger/5 border border-danger/10 text-danger text-xs flex items-center gap-2.5 font-medium">
                <svg className="h-4.5 w-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Products grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Beautiful Empty state */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-light border border-borders/80">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-dark">No products found</h3>
                  <p className="text-xs text-light max-w-xs font-normal">
                    We couldn&apos;t find anything matching &ldquo;{searchTerm}&rdquo;. Try another search term.
                  </p>
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="mt-20 border-t border-borders bg-white text-light text-xs" id="footer">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark text-white shadow-sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 17L12 22L22 17" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <span className="text-sm font-bold text-dark">
                Tech<span className="text-primary">Haven</span>
              </span>
            </div>
            <p className="text-xs font-normal text-light leading-relaxed">
              Redefining e-commerce with premium products, secure checkouts, and an unmatched customer shopping experience.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark mb-4">Shop Categories</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors">Laptops & Computers</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Smartphones & Tablets</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Audio & Wearables</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Accessories & Adapters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark mb-4">Support & Company</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/myaccount" className="hover:text-primary transition-colors">Manage Account</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">Order Tracking</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark mb-4">Subscribe to newsletter</h4>
            <p className="text-xs text-light font-normal leading-relaxed">Get exclusive deals, new releases, and tech stories direct to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@domain.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-borders bg-background text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
              />
              <button className="px-3.5 py-2 text-xs font-bold text-white bg-primary rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-borders py-6 text-center text-xs font-medium text-light bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Tech Haven. All rights reserved.</p>
            <div className="flex gap-3 items-center">
              {/* Payment Methods */}
              <span className="text-[9px] tracking-wider border border-borders px-2 py-0.5 rounded bg-white text-slate-500 font-bold">VISA</span>
              <span className="text-[9px] tracking-wider border border-borders px-2 py-0.5 rounded bg-white text-slate-500 font-bold">MASTERCARD</span>
              <span className="text-[9px] tracking-wider border border-borders px-2 py-0.5 rounded bg-white text-slate-500 font-bold">RUPAY</span>
              <span className="text-[9px] tracking-wider border border-borders px-2 py-0.5 rounded bg-white text-slate-500 font-bold">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
