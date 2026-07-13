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
    <div className="bg-background text-dark min-h-screen flex flex-col justify-between overflow-hidden">
      <div>
        {/* Promotional Marquee */}
        <div className="bg-blue-600 text-white overflow-hidden py-2.5 relative shadow-sm">
          <div className="animate-marquee whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] flex gap-12 items-center justify-center w-full">
            <span>Exclusive 10% instant discount on HDFC & ICICI Credit Cards. No minimum spend.</span>
            <span className="opacity-50">•</span>
            <span>Exclusive 10% instant discount on HDFC & ICICI Credit Cards. No minimum spend.</span>
            <span className="opacity-50">•</span>
            <span>Exclusive 10% instant discount on HDFC & ICICI Credit Cards. No minimum spend.</span>
          </div>
        </div>
        
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-16">
          
          {/* Immersive Hero Section */}
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 border border-slate-900 shadow-2xl group transition-all duration-700 isolate">
             {/* Background glow effects */}
             <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] -z-10 group-hover:bg-blue-600/40 transition-colors duration-1000"></div>
             <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 group-hover:bg-purple-600/30 transition-colors duration-1000"></div>
             
             <div className="relative py-24 md:py-32 px-6 md:px-16 text-center space-y-8 max-w-4xl mx-auto flex flex-col items-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/40 px-4 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Next-Gen Performance
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Pro Power. <br className="hidden md:block"/> Absolute Perfection.
                </h1>
                <p className="text-base md:text-xl text-slate-400 leading-relaxed font-medium max-w-2xl">
                  Experience the ultimate fusion of sleek design and raw power. Elevate your workflow with gear engineered for creators.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="#products" className="px-8 py-3.5 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 duration-300">
                    Buy Now
                  </Link>
                  <Link href="#products" className="px-8 py-3.5 rounded-full border border-slate-600 text-white font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 duration-300 backdrop-blur-sm">
                    Learn More
                  </Link>
                </div>
             </div>
          </section>

          {/* Category Chips */}
          <section className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
             {['All', 'Laptops', 'Audio', 'Wearables', 'Accessories'].map(cat => (
               <button key={cat} className={`px-6 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 hover:-translate-y-1 ${cat === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:shadow-md'}`}>
                 {cat}
               </button>
             ))}
          </section>

          {/* Bento Box Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 rounded-[2rem] bg-white border border-slate-200 p-8 md:p-10 flex flex-col justify-end min-h-[350px] relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent opacity-50" />
              <div className="relative z-10 space-y-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-700 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </span>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Seamless Connectivity</h3>
                <p className="text-slate-500 max-w-md font-medium text-base">Our new line of audio accessories pairs instantly and delivers lossless high-fidelity sound, anywhere you go.</p>
              </div>
            </div>
            <div className="col-span-1 rounded-[2rem] bg-blue-50 border border-blue-100 p-8 md:p-10 flex flex-col justify-end min-h-[350px] group hover:bg-blue-100 transition-colors duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                 <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.375C2.754 18 2.25 17.496 2.25 16.875V3.375c0-.621.504-1.125 1.125-1.125z" />
                 </svg>
               </div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Card Offers</h3>
                 <p className="text-blue-700 font-medium text-base mt-3 leading-relaxed">Unlock an exclusive 10% instant discount when you pay using HDFC or ICICI Credit Cards at checkout.</p>
               </div>
            </div>
          </section>

          {/* Products Section */}
          <main className="space-y-8" id="products">
            
            {/* Header & Better Search Bar */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-borders pb-6">
              <div className="space-y-1.5">
                <h2 className="text-3xl font-bold text-dark tracking-tight">
                  Featured Products
                </h2>
                <p className="text-sm text-light font-medium">
                  Explore our handpicked premium gear.
                </p>
              </div>

              {/* Redesigned Search Input */}
              <div className="relative w-full md:w-80 group">
                <input
                  type="text"
                  placeholder="Search for amazing products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-white text-sm text-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all duration-300"
                />
                <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="w-full aspect-square bg-slate-100 animate-shimmer rounded-xl" />
                    <div className="space-y-2.5">
                      <div className="h-4 bg-slate-100 animate-shimmer rounded w-3/4" />
                      <div className="h-3 bg-slate-100 animate-shimmer rounded w-1/2" />
                    </div>
                    <div className="h-10 bg-slate-100 animate-shimmer rounded-xl w-full mt-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/10 text-danger text-sm flex items-center gap-3 font-medium">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm border border-slate-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-dark">No products found</h3>
                  <p className="text-sm text-light max-w-sm font-medium">
                    We couldn&apos;t find anything matching &ldquo;{searchTerm}&rdquo;. Try another search term.
                  </p>
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-5 py-2.5 mt-2 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="mt-24 border-t border-slate-200 bg-white text-slate-500 text-sm" id="footer">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 17L12 22L22 17" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Tech<span className="text-blue-600">Haven</span>
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Redefining e-commerce with premium products, secure checkouts, and an unmatched customer shopping experience.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Shop Categories</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Laptops & Computers</Link></li>
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Smartphones & Tablets</Link></li>
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Audio & Wearables</Link></li>
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Accessories & Adapters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Support & Company</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/myaccount" className="hover:text-blue-600 transition-colors">Manage Account</Link></li>
              <li><Link href="/cart" className="hover:text-blue-600 transition-colors">Shopping Cart</Link></li>
              <li><Link href="/orders" className="hover:text-blue-600 transition-colors">Order Tracking</Link></li>
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-5">Subscribe</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Get exclusive deals and tech stories direct to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-300"
              />
              <button className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 py-6 text-center text-xs font-medium bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500">© {new Date().getFullYear()} Tech Haven. All rights reserved.</p>
            <div className="flex gap-3 items-center">
              <span className="text-[10px] tracking-wider border border-slate-200 px-2.5 py-1 rounded-md bg-white text-slate-600 font-bold shadow-sm">VISA</span>
              <span className="text-[10px] tracking-wider border border-slate-200 px-2.5 py-1 rounded-md bg-white text-slate-600 font-bold shadow-sm">MASTERCARD</span>
              <span className="text-[10px] tracking-wider border border-slate-200 px-2.5 py-1 rounded-md bg-white text-slate-600 font-bold shadow-sm">RUPAY</span>
              <span className="text-[10px] tracking-wider border border-slate-200 px-2.5 py-1 rounded-md bg-white text-slate-600 font-bold shadow-sm">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
