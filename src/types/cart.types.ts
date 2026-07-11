// ============================================================
// Cart Types
// Replaces: Mongoose Cart model + inline CartItem interface in useCartStore
// Used by: cartService, useCartStore, cart page
//
// Spring Boot Cart endpoints:
//   POST /cart/add        → returns CartItem
//   GET  /cart/user/{id}  → returns CartItem[]
//   PUT  /cart/{cartId}   → returns CartItem
//   DELETE /cart/{cartId} → 204 No Content
// ============================================================

// What Spring Boot stores as a cart row
export interface CartItem {
  id: number;          // cartId — primary key from Spring Boot DB
  productId: number;   // foreign key to products table
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;      // denormalized for display convenience
  userId?: number;     // the owner's user ID
}

// Payload for POST /cart/add
export interface AddToCartPayload {
  userId: number;
  productId: number;
  quantity: number;
}

// Payload for PUT /cart/{cartId}
export interface UpdateCartPayload {
  quantity: number;
}
