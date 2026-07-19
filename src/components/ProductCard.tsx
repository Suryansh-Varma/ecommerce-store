import Link from "next/link";
import { Product } from "@/types/product.types";
import ElectricBorder from "./ElectricBorder";

export default function ProductCard({ product }: { product: Product }) {
  // Use character code to pseudo-randomly but deterministically select 1 out of 3 products
  const isFeatured = String(product.id).charCodeAt(String(product.id).length - 1) % 3 === 0;

  const cardContent = (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150 h-full ${isFeatured ? 'border-transparent' : 'border-borders hover:border-slate-300'}`}>
      
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50/50 flex items-center justify-center border border-borders/40">
        <img
          src={product.imageUrl || product.image_url || "/placeholder.png"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-opacity duration-200 group-hover:opacity-95"
          loading="lazy"
        />
        {/* Minimalist Badge Overlay */}
        {(product.stock === 0 || product.isAvailable === false) ? (
          <span className="absolute top-2 left-2 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700 shadow-sm backdrop-blur-sm">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2 left-2 rounded border border-borders/85 bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
            New Arrivals
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3.5 flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-dark line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors duration-150">
          {product.name}
        </h3>
        
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-sm font-semibold text-dark">
            ₹{product.cost.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-light">
            <svg className="h-3 w-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>4.8</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/products/${product.id}`}
        className="mt-3.5 flex items-center justify-center gap-1.5 w-full rounded-lg border border-borders bg-white py-2 text-center text-xs font-semibold text-dark hover:bg-slate-50 hover:text-primary transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        View Details
        <svg className="h-3 w-3 text-light group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
      
    </div>
  );

  if (isFeatured) {
    return (
      <ElectricBorder
        color="#3B82F6"
        speed={1.5}
        chaos={0.12}
        thickness={2}
        style={{ borderRadius: '0.75rem' }}
        className="h-full"
      >
        {cardContent}
      </ElectricBorder>
    );
  }

  return cardContent;
}
