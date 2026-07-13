'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatResponse, ProductSuggestion } from '@/services/aiService';
import AIProductCard from './AIProductCard';
import OrderStatusCard from './OrderStatusCard';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: ChatResponse;
  timestamp: Date;
}

interface Props {
  message: Message;
  onAddToCart?: (product: ProductSuggestion) => void;
}

export default function ChatMessage({ message, onAddToCart }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] bg-gray-900 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const resp = message.response;

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2.5 max-w-[92%]">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-0.5">
          AI
        </div>

        <div className="flex flex-col gap-2 w-full">
          {/* Markdown Text Message */}
          <div className="bg-gray-50 border border-gray-100 text-gray-800 text-sm px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                h1: ({ children }) => <h1 className="text-base font-bold text-gray-900 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-gray-900 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-xs border-collapse w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-200 px-2 py-1">{children}</td>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Product Cards */}
          {resp?.products && resp.products.length > 0 && (
            <div className="flex flex-col gap-2">
              {resp.products.map((product) => (
                <AIProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

          {/* Order Status Card */}
          {resp?.orderInfo && (
            <OrderStatusCard order={resp.orderInfo} />
          )}

          {/* Timestamp */}
          <span className="text-[10px] text-gray-400 ml-1">
            {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
