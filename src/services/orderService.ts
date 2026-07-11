// ============================================================
// orderService.ts
// ============================================================
// WHY: Replaces the "Coming soon" placeholder in myaccount/page.tsx
// with real order management backed by Spring Boot.
//
// Spring Boot Endpoints (all require Authorization: Bearer <JWT>):
//   POST /orders/checkout/{userId}  → Order  (creates order from cart)
//   GET  /orders/user/{userId}      → Order[]
//   GET  /orders/{orderId}          → Order
// ============================================================

import axiosClient, { unwrapResponse } from './axiosClient';
import type { Order, OrderListResponse } from '@/types/order.types';

// ─── CHECKOUT ────────────────────────────────────────────────
// Converts the user's cart into a confirmed order.
// Spring Boot will clear the cart after checkout.
export interface CheckoutPayload {
  userId: number;
  addressId: number;
  paymentMethod: string;
  couponCode?: string | null;
}

export interface CheckoutResponse {
  orderId: number;
  paymentId: number;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  estimatedDeliveryDate: string;
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await axiosClient.post<unknown>(
    `/orders/checkout`,
    payload
  );
  return unwrapResponse<CheckoutResponse>(response.data);
}

// ─── GET ALL ORDERS FOR USER ──────────────────────────────────
// Used by the orders list page.
export async function getOrders(userId: number): Promise<OrderListResponse> {
  const response = await axiosClient.get<unknown>(
    `/orders/user/${userId}`
  );
  return unwrapResponse<OrderListResponse>(response.data);
}

// ─── GET SINGLE ORDER ─────────────────────────────────────────
// Used by the order detail page.
export async function getOrderById(orderId: number): Promise<Order> {
  const response = await axiosClient.get<unknown>(`/orders/${orderId}`);
  return unwrapResponse<Order>(response.data);
}
