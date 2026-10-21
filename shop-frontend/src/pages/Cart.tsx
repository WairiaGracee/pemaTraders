import { Link } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { useCart, selectSavings, selectSubtotal } from "@/store/cartStore";
import { formatKES } from "@/lib/format";
import { SHOP } from "@/lib/config";

export default function Cart() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const savings = useCart(selectSavings);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const whatsappLink = () => {
    const lines = items.map(
      (i) => `- ${i.qty} x ${i.product.name} (${formatKES(i.product.price * i.qty)})`
    );
    const text = `Hello ${SHOP.name}, I would like to order:\n${lines.join("\n")}\n\nTotal: ${formatKES(subtotal)}`;
    return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand/10 text-brand-dark">
          <ShoppingBag size={36} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-semibold text-ink transition hover:bg-brand-dark hover:text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
        <Link to="/" className="hover:text-brand-dark">Home</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-ink">Cart</span>
      </nav>

      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-extrabold">
          Shopping cart <span className="text-lg font-medium text-neutral-400">({items.length})</span>
        </h1>
        <button onClick={clear} className="text-sm font-medium text-neutral-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">

          {items.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4"
            >
                <Link to={`/product/${product.slug}`}>
                  <img
                  src={product.image}
                  alt={product.name}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28"
                  />
                </Link>
                
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-medium leading-snug">
                      <Link to={`/product/${product.slug}`} className="hover:text-brand-dark">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-1 text-sm">
                      <span className="font-bold text-brand-dark">{formatKES(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="ml-2 text-xs text-neutral-400 line-through">
                          {formatKES(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="h-fit text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-lg border border-neutral-300">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      aria-label="Decrease quantity"
                      className="grid h-9 w-9 place-items-center hover:bg-neutral-100"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      aria-label="Increase quantity"
                      className="grid h-9 w-9 place-items-center hover:bg-neutral-100"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <span className="font-bold">{formatKES(product.price * qty)}</span>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-block text-sm font-semibold text-brand-dark hover:underline">
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-40">
          <h2 className="text-lg font-bold">Order summary</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-medium">{formatKES(subtotal + savings)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discounts</dt>
                <dd className="font-medium">-{formatKES(savings)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex justify-between border-t border-neutral-200 pt-5 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatKES(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block rounded-full bg-brand py-3.5 text-center font-semibold text-ink transition hover:bg-brand-dark hover:text-white"
          >
            Proceed to checkout
          </Link>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-green-500 py-3.5 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
          >
            <MessageCircle size={18} /> Order on WhatsApp
          </a>

          <p className="mt-4 text-center text-xs text-neutral-500">
            Collect from our shop. Pay with M-Pesa or at pickup.
          </p>
        </aside>
      </div>
    </div>
  );
}