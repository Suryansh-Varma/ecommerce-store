'use client';

import { useCartStore } from '@/stores/useCartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getCart } from '@/services/cartService';
import type { CartItem } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import Navbar from '@/components/Navbar';

function CartContent() {
  const { items, setItems, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCartStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const checkingOut = false;
  const router = useRouter();
  // Load cart from Spring Boot on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    getCart(user.id)
      .then((serverItems) => {
        // Map Spring Boot CartItem to Zustand CartItem shape
        const mapped: CartItem[] = serverItems.map((si) => ({
            id: String(si.productId),
            cartId: si.id,
            name: si.productName,
            price: si.price,
            image: si.imageUrl ?? "/placeholder.png",
            imageUrl: si.imageUrl ?? "/placeholder.png",
            quantity: si.quantity,
            totalPrice: si.price * si.quantity,
          }));
        setItems(mapped);
      })
      .catch((err) => {
        console.error('Failed to fetch cart:', err);
      })
      .finally(() => setLoading(false));
  }, [user?.id, setItems]);

  // Check for duplicate IDs (debugging safeguard)
  useEffect(() => {
    const ids = items.map((item) => item.id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.warn('Duplicate item IDs detected in cart state');
    }
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = () => {
    
    router.push("/checkout");
}

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
            <div className="bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl p-6 md:p-8 animate-pulse space-y-6">
              <div className="h-5 bg-slate-100 rounded w-24" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-lg w-full" />
                  ))}
                </div>
                <div className="h-48 bg-slate-100 rounded-lg w-full" />
              </div>
            </div>
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
          
          {/* Header */}
          <div className="border-b border-borders pb-4">
            <h1 className="text-xl font-bold tracking-tight text-dark">Your Cart</h1>
            <p className="text-xs text-light mt-0.5">
              Review your items and complete your purchase.
            </p>
          </div>

          {items.length === 0 ? (
            /* Beautiful empty state */
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-light border border-borders/85">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-dark">Your cart is empty</h3>
                <p className="text-xs text-light max-w-xs font-normal">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
                Go shopping
              </Link>
            </div>
          ) : (
            /* Split layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Items Column */}
              <div className="lg:col-span-2 space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-borders p-3.5 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Image Frame */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-borders/50 bg-slate-50/50 flex items-center justify-center p-1.5">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      
                      {/* Details */}
                      <div>
                        <p className="font-semibold text-dark text-xs sm:text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls and delete */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-borders bg-slate-50/50 rounded-lg p-0.5">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="h-6 w-6 flex items-center justify-center text-xs font-bold text-dark hover:bg-slate-200/50 rounded-md transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-dark">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="h-6 w-6 flex items-center justify-center text-xs font-bold text-dark hover:bg-slate-200/50 rounded-md transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/5 border border-transparent hover:border-danger/10 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0M4.5 18v.01" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Column */}
              <div className="relative">
                <div className="sticky top-24 border border-borders bg-white rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5">
                  <h2 className="text-sm font-bold text-dark tracking-tight">Order Summary</h2>
                  
                  <div className="space-y-2.5 text-[11px] font-semibold text-light uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-dark font-semibold text-xs">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      <span className="rounded border border-success/20 bg-success/5 px-2 py-0.5 text-[9px] font-bold text-success capitalize tracking-normal">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Taxes(@18%)</span>
                      <span className="text-dark font-semibold text-xs">₹{(total * 0.0018).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="border-t border-borders pt-3.5 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-dark">Total</span>
                    <span className="text-lg font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {checkingOut ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </button>

                  {/* Trust Badges */}
                  <div className="border-t border-borders pt-3.5 flex flex-col gap-2 text-[10px] text-light">
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.746 3.746 0 01-3.068-.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                      <span>Secure 256-bit SSL checkout encryption.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.12-1.014L1.5 6H18.75m-18 12.75V12h11.25m-11.25 0c0-2.485 2.015-4.5 4.5-4.5M10.5 3h3a1.5 1.5 0 011.5 1.5v3M10.5 3a1.5 1.5 0 00-1.5 1.5v3m3-3h.008v.008H12V3zm.562 10.29l3 3m0 0l3-3m-3 3V12" />
                      </svg>
                      <span>Lightning-fast dispatch & order tracking.</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-borders py-5 text-center text-xs font-medium text-light bg-white">
        © {new Date().getFullYear()} Tech Haven. All rights reserved.
      </footer>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}