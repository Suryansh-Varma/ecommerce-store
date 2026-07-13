'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/useCartStore';
import { getProductById } from '@/services/productService';
import type { Product } from '@/types/product.types';
import Navbar from '@/components/Navbar';

// ─── REVIEW SECTION ───────────────────────────────────────────
function ReviewSection() {
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  return (
    <div className="mt-10 border-t border-borders pt-8">
      <h3 className="text-base font-bold text-dark mb-1">Customer Reviews</h3>
      <p className="text-xs text-light mb-6">
        Hear what our users have to say about this product.
      </p>

      {isAuthenticated ? (
        <form className="bg-white border border-borders rounded-xl p-5 space-y-4 max-w-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-dark">Your Rating:</span>
            <div className="relative">
              <select
                value={rating}
                onChange={(e) => setRating(+e.target.value)}
                className="appearance-none bg-slate-50 border border-borders rounded-lg px-3 py-1 pr-7 text-xs font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150 cursor-pointer"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-light">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-light uppercase tracking-wider">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
              className="w-full p-3 border border-borders bg-slate-50/50 rounded-lg text-xs text-dark placeholder-light focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-150"
              rows={4}
            />
          </div>

          <button
            type="button"
            disabled
            title="Review submission coming soon"
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 cursor-not-allowed"
          >
            Submit Review (Coming Soon)
          </button>
        </form>
      ) : (
        <div className="inline-flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border border-borders">
          <p className="text-xs text-light">
            <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link> to leave a review.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch product from Spring Boot GET /products/{id}
  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({
      id: String(product.id),
      name: product.name,
      price: product.cost,
      image: product.imageUrl || product.image_url || '',
      quantity: 1,
    });
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
            <div className="bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl p-6 md:p-8 animate-pulse space-y-6">
              <div className="h-5 bg-slate-100 rounded w-24" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-square bg-slate-100 rounded-lg" />
                <div className="space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-5 bg-slate-100 rounded w-1/4" />
                  <div className="h-3.5 bg-slate-100 rounded w-full" />
                  <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                  <div className="h-8 bg-slate-100 rounded-lg w-32 mt-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/5 text-danger border border-danger/20 mx-auto">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-dark tracking-tight">Product Not Found</h1>
            <p className="text-xs text-light">The item you are looking for does not exist or has been removed.</p>
            <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
      <div>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-6">
          {/* Back Navigation */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-light hover:text-primary transition-colors duration-150"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Products
          </Link>

          {/* Product Box */}
          <div className="bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Product Image Column */}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50/50 flex items-center justify-center border border-borders/40">
                <img
                  src={product.imageUrl || product.image_url || "/placeholder.png"}
                  alt={product.name}
                  className="h-full w-full object-contain p-6 transition-opacity duration-200 hover:opacity-95"
                />
              </div>

              {/* Product Details Column */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  
                  {/* Category / Tags */}
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center rounded border border-blue-100 bg-blue-50/50 px-2 py-0.5 text-[9px] font-semibold text-primary">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded border border-red-100 bg-red-50 px-2 py-0.5 text-[9px] font-semibold text-red-700">
                      Out of Stock
                    </span>
                  )}

                  <h1 className="text-xl md:text-2xl font-bold text-dark tracking-tight">
                    {product.name}
                  </h1>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg key={idx} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-light">(4.8 rating • 42 reviews)</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    {product.description ||
                      'A great product engineered with excellent materials, high durability, and advanced functionality. Perfect for seamless daily integration.'}
                  </p>
                </div>

                {/* Purchase / Actions */}
                <div className="border-t border-borders pt-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-dark">
                      ₹{product.cost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-light line-through">
                      ₹{(product.cost * 1.2).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {product.stock > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors duration-150"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-100 border border-transparent text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Review section inclusion */}
            <ReviewSection />
          </div>
        </div>
      </div>

      {/* Quick compact footer */}
      <footer className="border-t border-borders py-5 text-center text-xs font-medium text-light bg-white">
        © {new Date().getFullYear()} Tech Haven. All rights reserved.
      </footer>
    </div>
  );
}
