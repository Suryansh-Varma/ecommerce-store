// ============================================================
// useCartStore.ts — Zustand Cart Store
// ============================================================
// CHANGES MADE:
//   REMOVED: import { getSession } from 'next-auth/react'     ← NextAuth dependency
//   REMOVED: All direct fetch('/api/cart/...') calls           ← Deleted API routes
//   REMOVED: getSession() call in every action                 ← Replaced by localStorage
//
//   ADDED: import * as cartService from '@/services/cartService'
//   ADDED: Read userId from localStorage ('auth_user' key set by AuthContext)
//   ADDED: cartId tracking — Spring Boot returns a cartId per row (needed for PUT/DELETE)
//
// PRESERVED: All action names (addToCart, increaseQuantity, decreaseQuantity,
//            removeFromCart, clearCart) — so cart page JSX needs ZERO changes.
// PRESERVED: persist middleware with localStorage 'cart-storage' key.
// PRESERVED: CartItem interface shape (extended to include cartId).
//
// KEY CHANGE — CartItem now has cartId:
//   Spring Boot's cart model has an id (primary key) per cart row.
//   PUT /cart/{cartId} and DELETE /cart/{cartId} require this id.
//   The old code used productId for everything — that was wrong for Spring Boot.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as cartService from '@/services/cartService';
import type { AddToCartPayload } from '@/types/cart.types';

// Extended CartItem — includes Spring Boot's DB primary key
export interface CartItem {
  id: string;       // productId (string for compatibility with existing UI)
  cartId?: number;  // Spring Boot cart row primary key (needed for PUT/DELETE)
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => Promise<void>;
  increaseQuantity: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => void;
}

// ─── HELPER — Get current user's numeric ID from localStorage ─
// AuthContext stores { id, name, email } as JSON under 'auth_user'.
// Returns 0 if not logged in (guest cart — local only, not synced).
function getCurrentUserId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return 0;
    const user = JSON.parse(raw);
    return user?.id ?? 0;
  } catch {
    return 0;
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      // ── ADD TO CART ───────────────────────────────────────
      // Optimistic update: update local state first for instant UI feedback,
      // then sync to Spring Boot.
      addToCart: async (item) => {
        try {
          const userId = getCurrentUserId();

          // Optimistic local update
          const existingItem = get().items.find((i) => i.id === item.id);
          set({
            items: existingItem
              ? get().items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              : [...get().items, item],
          });

          // Sync to Spring Boot (only if user is logged in)
          if (userId) {
            const payload: AddToCartPayload = {
              userId,
              productId: Number(item.id),
              quantity: item.quantity,
            };
            const serverItem = await cartService.addToCart(payload);
            // Update cartId in local state so PUT/DELETE work correctly
            set({
              items: get().items.map((i) =>
                i.id === item.id ? { ...i, cartId: serverItem.id } : i
              ),
            });
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      },

      // ── INCREASE QUANTITY ─────────────────────────────────
      // Uses Spring Boot PUT /cart/{cartId}
      increaseQuantity: async (id) => {
        try {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;

          // Optimistic update
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));

          // Sync to Spring Boot
          if (item.cartId) {
            await cartService.updateCartItem(item.cartId, {
              quantity: item.quantity + 1,
            });
          }
        } catch (error) {
          console.error('Error increasing quantity:', error);
        }
      },

      // ── DECREASE QUANTITY ─────────────────────────────────
      decreaseQuantity: async (id) => {
        try {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;

          const newQuantity = item.quantity - 1;

          if (newQuantity <= 0) {
            // Remove the item entirely
            await get().removeFromCart(id);
            return;
          }

          // Optimistic update
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: newQuantity } : i
            ),
          }));

          // Sync to Spring Boot
          if (item.cartId) {
            await cartService.updateCartItem(item.cartId, {
              quantity: newQuantity,
            });
          }
        } catch (error) {
          console.error('Error decreasing quantity:', error);
        }
      },

      // ── REMOVE FROM CART ──────────────────────────────────
      // Uses Spring Boot DELETE /cart/{cartId}
      removeFromCart: async (id) => {
        try {
          const item = get().items.find((i) => i.id === id);

          // Remove from local state immediately
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          }));

          // Sync to Spring Boot
          if (item?.cartId) {
            await cartService.deleteCartItem(item.cartId);
          }
        } catch (error) {
          console.error('Error removing item:', error);
        }
      },

      // ── CLEAR CART ────────────────────────────────────────
      // Clears local state only (called after checkout).
      // Spring Boot clears the DB cart during POST /orders/checkout/{userId}.
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
