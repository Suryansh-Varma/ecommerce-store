// ============================================================
// productService.ts
// ============================================================
// WHY: Replaces the static `src/data/products.ts` array with
// live data from the Spring Boot backend.
// Also replaces the product lookup `products.find(p => p.id === id)`
// in src/app/products/[id]/page.tsx.
//
// Spring Boot Endpoints:
//   GET /products        → Product[]
//   GET /products/{id}   → Product
// These endpoints are PUBLIC — no Authorization header required.
// ============================================================

import axiosClient, { unwrapResponse } from './axiosClient';
import type { Product } from '@/types/product.types';

// ─── GET ALL PRODUCTS ─────────────────────────────────────────
// Used by: homepage (src/app/page.tsx)
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await axiosClient.get<unknown>('/products');
    console.log('API Response:', response.data);
    return unwrapResponse<Product[]>(response.data);
  } catch (error) {
    console.error('Product API Error:', error);
    throw error;
  }
}

// ─── GET PRODUCT BY ID ───────────────────────────────────────
// Used by: product detail page (src/app/products/[id]/page.tsx)
export async function getProductById(id: number | string): Promise<Product> {
  const response = await axiosClient.get<unknown>(`/products/${id}`);
  return unwrapResponse<Product>(response.data);
}
