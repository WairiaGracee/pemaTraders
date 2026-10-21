import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Check, ChevronRight, CreditCard, MessageCircle, Minus, Plus, ShoppingCart, Store,
} from "lucide-react";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { useCart } from "@/store/cartStore";
import { formatKES } from "@/lib/format";
import { SHOP } from "@/lib/config";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

function Detail({ product, related }: { product: Product; related: Product[] }) {
  const { categories } = useCategories();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const category = categories.find((c) => c.slug === product.category);
  const maxQty = Math.min(product.stock, 99);
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  const saving = product.compareAtPrice ? product.compareAtPrice - product.price : 0;

  useEffect(() => {
    document.title = `${product.name} | ${SHOP.name}`;
    return () => {
      document.title = SHOP.name;
    };
  }, [product.name]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
  };

  const waText = `Hello ${SHOP.name}, I'm interested in "${product.name}" (${window.location.href}).`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
        <Link to="/" className="hover:text-brand-dark">Home</Link>
        <ChevronRight size={14} />
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="hover:text-brand-dark">
              {category.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover ${product.inStock ? "" : "opacity-60 grayscale"}`}
          />
          {product.inStock && discount > 0 && (
            <span className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          {category && (
            <Link
              to={`/category/${category.slug}`}
              className="text-sm font-semibold uppercase tracking-widest text-brand-dark hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-dark">{formatKES(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-neutral-400 line-through">
                  {formatKES(product.compareAtPrice)}
                </span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-semibold text-green-700">
                  Save {formatKES(saving)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className="mt-4 text-sm font-semibold">
            {product.stock === 0 ? (
              <span className="text-red-600">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-700">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-green-600">In stock</span>
            )}
          </p>

          {/* Description */}
          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}

          {/* Quantity and actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {product.inStock && (
              <div className="flex items-center rounded-lg border border-neutral-300">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-12 w-12 place-items-center hover:bg-neutral-100 disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Increase quantity"
                  className="grid h-12 w-12 place-items-center hover:bg-neutral-100 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-8 font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 sm:flex-none"
            >
              {!product.inStock ? (
                "Out of stock"
              ) : added ? (
                <>
                  <Check size={18} /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to cart
                </>
              )}
            </button>
          </div>

          {added && (
            <Link to="/cart" className="mt-3 inline-block text-sm font-semibold text-brand-dark hover:underline">
              View cart and checkout →
            </Link>
          )}

          <a
            href={`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-fit items-center gap-2 rounded-full border border-green-500 px-6 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
          >
            <MessageCircle size={18} /> Ask about this product
          </a>

          {/* Reassurance */}
          <ul className="mt-8 space-y-3 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
            <li className="flex items-center gap-3">
              <Store size={18} className="shrink-0 text-brand-dark" />
              Collect from our shop: {SHOP.address}
            </li>
            <li className="flex items-center gap-3">
              <CreditCard size={18} className="shrink-0 text-brand-dark" />
              Pay with M-Pesa online, or at the shop when you collect
            </li>
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pt-16">
          <h2 className="mb-5 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, isLoading } = useProducts();

  if (isLoading) return <div className="py-24 text-center text-neutral-500">Loading...</div>;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-neutral-500">It may have been removed or is no longer available.</p>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-brand-dark hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // key resets quantity when moving between products
  return <Detail key={product.id} product={product} related={related} />;
}