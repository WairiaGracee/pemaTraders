import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { formatKES } from "@/lib/format";
import { useCart } from "@/store/cartStore";

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium">{product.name}</h3>
        <div className="mt-2">
          <span className="font-bold text-brand-dark">{formatKES(product.price)}</span>
          {product.compareAtPrice && (
            <span className="ml-2 text-xs text-neutral-400 line-through">
              {formatKES(product.compareAtPrice)}
            </span>
          )}
        </div>
        <button
          onClick={() => add(product)}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-ink py-2 text-sm font-medium text-white transition hover:bg-brand"
        >
          <ShoppingCart size={16} /> Add to cart
        </button>
      </div>
    </div>
  );
}