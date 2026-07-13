import axiosClient from './axiosClient';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ProductSuggestion {
  id: number;
  name: string;
  cost: number;
  category: string;
  imageUrl: string;
  stock: number;
  reason: string;
}

export interface OrderInfo {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingName?: string;
  shippingAddress?: string;
}

export type ResponseType = 'TEXT' | 'PRODUCTS' | 'ORDER' | 'COMPARISON';

export interface ChatResponse {
  message: string;
  responseType: ResponseType;
  products?: ProductSuggestion[];
  orderInfo?: OrderInfo;
  suggestedQuestions?: string[];
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  sessionId?: string;
}

/**
 * Send a chat message to the AI backend.
 * Uses /ai/chat (JWT authenticated). Requires authentication.
 */
export async function sendAIMessage(
  message: string,
  history: ChatMessage[],
  token?: string | null
): Promise<ChatResponse> {
  if (!token) {
    throw new Error('Authentication required to use AI chat');
  }

  const payload: ChatRequest = { message, history };
  const endpoint = '/ai/chat';

  const res = await axiosClient.post(endpoint, payload);
  // Unwrap Spring Boot ApiResponse envelope: { success, message, data }
  const body = res.data;
  if (body && body.data) {
    return body.data as ChatResponse;
  }
  throw new Error(body?.message || 'Unexpected AI response format');
}
