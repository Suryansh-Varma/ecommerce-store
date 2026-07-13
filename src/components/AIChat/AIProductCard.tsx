'use client';

import { ProductSuggestion } from '@/services/aiService';
import Link from 'next/link';

interface Props {
  product: ProductSuggestion;
  onAddToCart?: (product: ProductSuggestion) => void;
}

export default function AIProductCard({ product, onAddToCart }: Props) {
  const inStock = product.stock > 0;

  return (
    <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow duration-200 w-full">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/64x64?text=📦';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{product.name}</p>
        {product.category && (
          <span className="inline-block text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
            {product.category}
          </span>
        )}
        <p className="text-sm font-bold text-gray-900 mt-1">
          ₹{product.cost.toLocaleString('en-IN')}
        </p>
        {!inStock && (
          <span className="text-[10px] font-medium text-red-500">Out of Stock</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <Link
            href={`/products/${product.id}`}
            className="text-xs font-medium text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View
          </Link>
          {inStock && onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              className="text-xs font-medium text-white bg-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
