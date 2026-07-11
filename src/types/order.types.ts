// ============================================================
// Order Types
// Replaces: placeholder "Coming soon" in myaccount/page.tsx
// Used by: orderService, orders page, order detail page
//
// Spring Boot Order endpoints:
//   POST /orders/checkout/{userId}  → creates order, returns Order
//   GET  /orders/user/{userId}      → returns Order[]
//   GET  /orders/{orderId}          → returns Order
// ============================================================

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderDate: string;      // <-- was createdAt
  totalAmount: number;    // <-- was totalPrice
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
}

// Shape of GET /orders/user/{userId} response
export type OrderListResponse = Order[];
