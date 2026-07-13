'use client';

import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestedPrompts from './SuggestedPrompts';
import { sendAIMessage, ChatMessage as APIChatMessage, ProductSuggestion } from '@/services/aiService';

const STARTER_PROMPTS = [
  'Recommend a laptop',
  'Track my order',
  'Find gaming accessories',
  'Compare two phones',
  'Available coupons',
  'Best value products',
];

interface Props {
  token?: string | null;
  onAddToCart?: (product: ProductSuggestion) => void;
  onClose: () => void;
  onClear: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatWindow({ token, onAddToCart, onClose, onClear, messages, setMessages }: Props) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildAPIHistory = (): APIChatMessage[] => {
    return messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }));
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // Add user message
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = buildAPIHistory();
      const response = await sendAIMessage(trimmed, history, token);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // If there are suggested follow-up questions, briefly show them as chips
      // (handled via the response object in ChatWindow)
    } catch (err) {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const lastSuggestions = messages.length > 0
    ? messages[messages.length - 1]?.response?.suggestedQuestions
    : undefined;

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      style={{ width: '380px', height: '580px' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gray-900 text-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold shadow-inner">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">TechHeaven AI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Shopping Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear chat */}
          <button
            onClick={onClear}
            title="Clear chat"
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
            </svg>
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
              AI
            </div>
            <p className="text-gray-800 font-semibold text-sm">Hi! I'm TechHeaven AI</p>
            <p className="text-gray-500 text-xs mt-1 max-w-[220px] leading-relaxed">
              Ask me anything — find products, compare, track orders, or get support.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onAddToCart={onAddToCart} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested Follow-up Prompts ── */}
      {!isTyping && lastSuggestions && lastSuggestions.length > 0 && (
        <div className="border-t border-gray-100 pt-2">
          <SuggestedPrompts prompts={lastSuggestions.slice(0, 3)} onSelect={handleSend} />
        </div>
      )}

      {/* ── Starter Prompts (empty state) ── */}
      {messages.length === 0 && !isTyping && (
        <div className="border-t border-gray-100 pt-2">
          <SuggestedPrompts prompts={STARTER_PROMPTS} onSelect={handleSend} />
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-gray-400 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            disabled={isTyping}
            className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 disabled:opacity-50"
            maxLength={500}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          {token ? '🔒 Personalised mode — accessing your account data' : '🔓 Sign in for personalised support'}
        </p>
      </div>
    </div>
  );
}
