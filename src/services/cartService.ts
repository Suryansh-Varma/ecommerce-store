// ============================================================
// cartService.ts
// ============================================================
// WHY: Replaces all the broken/incomplete Next.js cart API routes:
//   - POST /api/cart/add   (was calling Mongoose Cart incorrectly)
//   - GET  /api/cart/get   (was broken — Pages Router style in App Router dir)
//   - PUT  /api/cart/update  (DID NOT EXIST — caused silent 404)
//   - DELETE /api/cart/remove (DID NOT EXIST — caused silent 404)
//   - DELETE /api/cart/clear  (DID NOT EXIST — caused silent 404)
//
// Spring Boot Endpoints (all require Authorization: Bearer <JWT>):
//   POST   /cart/add          → CartItem
//   GET    /cart/user/{id}    → CartItem[]
//   PUT    /cart/{cartId}     → CartItem
//   DELETE /cart/{cartId}     → void (204)
// ============================================================

import axiosClient, { unwrapResponse } from './axiosClient';
import type {
  CartItem,
  AddToCartPayload,
  UpdateCartPayload,
} from '@/types/cart.types';

// ─── ADD TO CART ──────────────────────────────────────────────
// Called when user clicks "Add to Cart" on product detail page.
// The axiosClient interceptor adds Authorization header automatically.
export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  const response = await axiosClient.post<unknown>('/cart/add', payload);
  return unwrapResponse<CartItem>(response.data);
}

// ─── GET CART ─────────────────────────────────────────────────
// Called when cart page mounts — loads the user's persisted cart from DB.
export async function getCart(userId: number): Promise<CartItem[]> {
  const response = await axiosClient.get<unknown>(`/cart/user/${userId}`);
  return unwrapResponse<CartItem[]>(response.data);
}

// ─── UPDATE CART ITEM ─────────────────────────────────────────
// Called when user clicks + or − on a cart item.
// Spring Boot uses cartId (the DB primary key of the cart row).
export async function updateCartItem(
  cartId: number,
  payload: UpdateCartPayload
): Promise<CartItem> {
  const response = await axiosClient.put<unknown>(`/cart/${cartId}`, payload);
  return unwrapResponse<CartItem>(response.data);
}

// ─── DELETE CART ITEM ─────────────────────────────────────────
// Called when user clicks the trash icon on a cart item.
export async function deleteCartItem(cartId: number): Promise<void> {
  await axiosClient.delete(`/cart/${cartId}`);
}
