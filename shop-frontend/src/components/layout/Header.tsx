import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { SHOP } from "@/lib/config";
import { useCategories } from "@/hooks/useCatalog";
import { useCart, selectCount } from "@/store/cartStore";
import { useAuth } from "@/store/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const count = useCart(selectCount);
  const { user, profile } = useAuth();
  const { categories } = useCategories();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-ink text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <span className="hidden sm:block">Collect from our shop: {SHOP.hours}</span>
          <span className="flex items-center gap-1 sm:ml-auto">
            <Phone size={12} /> {SHOP.phone}
          </span>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>

        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-brand">{SHOP.name}</span>
          <span className="hidden text-xs uppercase tracking-widest text-neutral-500 sm:block">
            {SHOP.tagline}
          </span>
        </Link>

        <form onSubmit={submitSearch} className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for TVs, sofas, carpets, duvets..."
            className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2.5 pl-5 pr-12 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand"
          >
            <Search size={18} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <Link to={user ? "/account" : "/login"} className="flex items-center gap-1 text-sm">
            <User size={20} />
            <span className="hidden sm:inline">
              {user ? profile?.full_name?.split(" ")[0] ?? "Account" : "Sign in"}
            </span>
          </Link>

          <Link to="/cart" className="relative flex items-center gap-1 text-sm">
            <ShoppingCart size={22} />
            <span className="hidden sm:block">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden border-t border-neutral-100 lg:block">
        <ul className="mx-auto flex max-w-7xl gap-7 px-4 py-2.5 text-sm font-medium">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to={`/category/${c.slug}`} className="hover:text-brand">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-neutral-100 bg-white lg:hidden">
          <ul className="px-4 py-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/category/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-neutral-100 py-3 text-sm"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}