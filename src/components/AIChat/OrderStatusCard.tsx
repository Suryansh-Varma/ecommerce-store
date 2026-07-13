'use client';

import { OrderInfo } from '@/services/aiService';
import Link from 'next/link';

interface Props {
  order: OrderInfo;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pending',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  SHIPPED:   { label: 'Shipped',   color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  DELIVERED: { label: 'Delivered', color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
};

export default function OrderStatusCard({ order }: Props) {
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
  const formattedDate = order.orderDate
    ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 w-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500">Order</p>
          <p className="text-sm font-bold text-gray-900">#{order.orderId}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Ordered on</span>
          <span className="text-gray-800 font-medium">{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="text-gray-900 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        </div>
        {order.shippingAddress && (
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 flex-shrink-0">Ship to</span>
            <span className="text-gray-700 text-right text-xs leading-tight">{order.shippingAddress}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/orders/${order.orderId}`}
        className="mt-3 block text-center text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
      >
        View Full Details →
      </Link>
    </div>
  );
}
