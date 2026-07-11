// ============================================================
// Product Types
// Replaces: the inline product objects from src/data/products.ts
// Used by: productService, homepage, product detail page, cart
// ============================================================

export interface Product {
  id: number;
  name: string;
  cost: number;
  image_url: string;
  imageUrl?: string;
  description?: string;
  category?: string;
}

// Shape of the array returned by GET /products
export type ProductListResponse = Product[];
