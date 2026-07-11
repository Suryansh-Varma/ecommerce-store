'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getOrderById } from '@/services/orderService';
import type { Order } from '@/types/order.types';
import Navbar from '@/components/Navbar';
import axiosClient from '@/services/axiosClient';
import { toast, ToastContainer } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200/80',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200/80',
};

function OrderDetailContent() {
  const { orderId } = useParams() as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(Number(orderId))
      .then(setOrder)
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await axiosClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully.');
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download invoice PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-10 space-y-6">
            <div className="flex items-center justify-between border-b border-borders pb-4">
              <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
              <div className="h-9 bg-slate-200 rounded w-32 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-borders rounded-xl p-6 h-56 animate-pulse" />
                <div className="bg-white border border-borders rounded-xl p-6 h-36 animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="bg-white border border-borders rounded-xl p-6 h-48 animate-pulse" />
                <div className="bg-white border border-borders rounded-xl p-6 h-48 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen text-dark flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/5 text-danger border border-danger/20 mx-auto">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-dark tracking-tight">{error ?? 'Order not found.'}</h1>
            <Link href="/orders" className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Delivery date estimate (orderDate + 5 days)
  const orderDateObj = new Date(order.orderDate);
  const estDate = new Date(orderDateObj);
  estDate.setDate(orderDateObj.getDate() + 5);
  const formattedEstDate = estDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-dark flex flex-col justify-between font-sans">
      <div>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        <div className="max-w-6xl mx-auto px-6 md:px-8 py-10 space-y-6">
          
          {/* Navigation & Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link href="/orders" className="hover:text-primary transition-colors">Orders</Link>
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-slate-800 font-bold">Order Details</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order #{order.orderId}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-800" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Invoice
                  </>
                )}
              </button>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Products and Shipping */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SECTION: Products */}
              <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Products</h2>
                  <span className="text-xs font-medium text-slate-500">{order.items?.length ?? 0} item(s)</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#fbfbfb] flex items-center justify-center p-2">
                          <img src={item.imageUrl || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{item.productName}</h4>
                          <p className="text-xs text-slate-500">
                            Unit Price: <span className="font-medium text-slate-700">₹{item.unitPrice.toLocaleString('en-IN')}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Quantity: <span className="font-semibold text-slate-800">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-950 text-sm">
                          ₹{(item.subtotal ?? item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: Shipping Address */}
              <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Shipping Address</h2>
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-400 font-medium">Customer Name:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{order.shippingName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-400 font-medium">Phone Number:</span>
                    <span className="col-span-2 text-slate-800 font-medium">{order.shippingPhone || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-400 font-medium">Address:</span>
                    <span className="col-span-2 text-slate-700 leading-relaxed font-normal">{order.shippingAddress || 'No shipping address recorded.'}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Order Header, Breakdown, Payment */}
            <div className="space-y-6">
              
              {/* SECTION: Order Header / Info */}
              <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Order Info</h2>
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Order Number:</span>
                    <span className="text-slate-800 font-bold">#{order.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Order Date:</span>
                    <span className="text-slate-800 font-medium">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Order Status:</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                        STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  {order.status !== 'CANCELLED' && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Estimated Delivery:</span>
                      <span className="text-slate-800 font-semibold text-right">{formattedEstDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Payment Status:</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                        PAYMENT_STATUS_COLORS[order.paymentStatus || 'PENDING'] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </section>

              {/* SECTION: Price Breakdown */}
              <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Summary</h2>
                </div>
                
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-800 font-medium">₹{(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {order.couponCode && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Coupon Applied</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 text-[10px]">
                          {order.couponCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Discount</span>
                        <span className="text-rose-600 font-medium">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Shipping</span>
                    <span className="text-emerald-700 font-medium">FREE</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tax</span>
                    <span className="text-slate-400 italic">₹{ (order.subtotal * 0.0018).toLocaleString('en-IN') }</span>
                  </div>

                  <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-100 pt-3.5 mt-2">
                    <span className="text-sm">Grand Total</span>
                    <span className="text-primary text-base">₹{(order.totalAmount+(order.subtotal * 0.0018)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </section>

              {/* SECTION: Payment Details */}
              <section className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Payment Details</h2>
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Method:</span>
                    <span className="text-slate-800 font-semibold">{order.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                        PAYMENT_STATUS_COLORS[order.paymentStatus || 'PENDING'] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-400 font-medium">Transaction ID:</span>
                    <span className="text-slate-700 text-xs font-mono bg-[#fcfcfc] border border-slate-100 p-2 rounded break-all">
                      {order.transactionId || 'N/A'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-xs font-medium text-slate-400 bg-white">
        © {new Date().getFullYear()} Smart Commerce. All rights reserved.
      </footer>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
