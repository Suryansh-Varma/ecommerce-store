'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { Message } from './ChatMessage';
import { ProductSuggestion } from '@/services/aiService';
import { useCartStore } from '@/stores/useCartStore';

// Lazy-load ChatWindow — no SSR needed for the chat widget
const ChatWindow = dynamic(() => import('./ChatWindow'), { ssr: false });

/**
 * AIChat — floating AI assistant widget.
 * Renders a fixed bottom-right button. On click, opens the ChatWindow.
 * Added to the root layout so it appears on every page.
 */
export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pulse, setPulse] = useState(true);

  const { token, isAuthenticated } = useAuth();
  const { addToCart } = useCartStore();
  const auth = useAuth();

  // Hide the AI widget completely if the user is not logged in
  if (!isAuthenticated) {
    return null;
  }

  // Stop pulse ring after first interaction
  const handleOpen = () => {
    setIsOpen(true);
    setPulse(false);
  };

  const handleClose = () => setIsOpen(false);

  const handleClear = () => {
    setMessages([]);
  };

  const handleAddToCart = useCallback(
    async (product: ProductSuggestion) => {
      if (!isAuthenticated || !auth.user) {
        alert('Please sign in to add items to your cart.');
        return;
      }
      try {
        await addToCart({
          id: String(product.id),
          name: product.name,
          price: product.cost,
          image: product.imageUrl || '',
          quantity: 1,
        });
      } catch (err) {
        console.error('Add to cart from AI failed:', err);
      }
    },
    [isAuthenticated, auth.user, addToCart]
  );

  return (
    <>
      {/* ── Chat Window (visible when open) ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[100]"
          style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.18))' }}
        >
          <div
            className="animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{ animation: 'chatSlideIn 0.2s ease-out' }}
          >
            <ChatWindow
              token={token}
              onAddToCart={handleAddToCart}
              onClose={handleClose}
              onClear={handleClear}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {/* Pulse ring — shows until first click */}
        {pulse && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
        )}

        <button
          onClick={isOpen ? handleClose : handleOpen}
          title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          className={`
            relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${isOpen
              ? 'bg-gray-700 rotate-45 scale-95'
              : 'bg-gray-900 hover:bg-gray-700 hover:scale-105 active:scale-95'
            }
          `}
        >
          {isOpen ? (
            /* Close X icon */
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Sparkle / AI icon */
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
              Ask AI
            </span>
          </div>
        )}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
