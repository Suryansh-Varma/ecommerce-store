'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getOrders } from '@/services/orderService';
import type { Order } from '@/types/order.types';
import Navbar from '@/components/Navbar';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning/5 text-warning border-warning/20',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
  SHIPPED: 'bg-indigo-50 text-secondary border-indigo-100',
  DELIVERED: 'bg-success/5 text-success border-success/20',
  CANCELLED: 'bg-danger/5 text-danger border-danger/20',
};

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getOrders(user.id)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
            <div className="bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl p-6 md:p-8 animate-pulse space-y-6">
              <div className="h-5 bg-slate-100 rounded w-24" />
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/5 text-danger border border-danger/20 mx-auto">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-dark tracking-tight">{error}</h1>
            <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
              Back to Catalog
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

        <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-borders pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-dark">Order History</h1>
              <p className="text-xs text-light mt-0.5">
                View details, status tracking, and receipts of your past purchases.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dark bg-white border border-borders rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955M2.25 12h19.5M2.25 12l8.954 8.955" />
              </svg>
              Dashboard
            </Link>
          </div>

          {orders.length === 0 ? (
            /* Beautiful Empty State */
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl bg-white border border-borders shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-light border border-borders/85">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-dark">No orders yet</h3>
                <p className="text-xs text-light max-w-xs font-normal">
                  You haven&apos;t placed any orders on Tech Haven yet.
                </p>
              </div>
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Orders list */
            <div className="space-y-3.5">
              {orders.map((order) => (
                <Link
                  key={order.orderId}
                  href={`/orders/${order.orderId}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border border-borders rounded-xl p-5 bg-white hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)] gap-4 transition-all duration-150"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-dark text-xs sm:text-sm">Order #{order.orderId}</p>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                          STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-light">
                      Placed on:{' '}
                      <span className="text-dark font-medium">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-borders px-2 py-0.5 rounded">
                      {order.items?.length ?? 0} item(s)
                    </div>
                  </div>

                  <div className="border-t sm:border-t-0 border-borders/60 pt-3 sm:pt-0 flex flex-col sm:text-right sm:items-end justify-center text-xs text-light gap-1 min-w-[200px]">
                    <div className="flex justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <span>Subtotal:</span>
                      <span className="text-dark font-medium">₹{(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span>
                    </div>
                    {order.couponCode && (
                      <>
                        <div className="flex justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span>Coupon:</span>
                          <span className="text-success font-semibold">{order.couponCode}</span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span>Discount:</span>
                          <span className="text-danger font-medium">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between sm:justify-end gap-4 w-full sm:w-auto font-bold pt-1 border-t border-dashed border-borders/60 sm:border-0">
                      <span className="text-dark text-xs sm:text-sm">Grand Total:</span>
                      <span className="text-primary text-sm sm:text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
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

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
