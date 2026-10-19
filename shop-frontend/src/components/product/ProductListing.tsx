import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import FilterPanel, { defaultFilters, type Filters } from "./FilterPanel";

type SortKey = "featured" | "price-asc" | "price-desc" | "name" | "discount";

const discountOf = (p: Product) => (p.compareAtPrice ? 1 - p.price / p.compareAtPrice : 0);

const sorters: Record<SortKey, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
  discount: (a, b) => discountOf(b) - discountOf(a),
};

interface Props {
  title: string;
  description?: string;
  crumbs: { label: string; to?: string }[];
  items: Product[];
  activeSlug?: string;
}

export default function ProductListing({ title, description, crumbs, items, activeSlug }: Props) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const visible = useMemo(() => {
    const min = filters.min === "" ? 0 : Number(filters.min);
    const max = filters.max === "" ? Infinity : Number(filters.max);

    const list = items.filter(
      (p) =>
        p.price >= min &&
        p.price <= max &&
        (!filters.inStock || p.inStock) &&
        (!filters.onSale || p.compareAtPrice)
    );

    const sorter = sorters[sort];
    return sorter ? [...list].sort(sorter) : list;
  }, [items, filters, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1">
            {c.to ? (
              <Link to={c.to} className="hover:text-brand-dark">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-ink">{c.label}</span>
            )}
            {i < crumbs.length - 1 && <ChevronRight size={14} />}
          </span>
        ))}
      </nav>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {description && <p className="mt-1 text-neutral-500">{description}</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters (always visible on desktop, toggle on mobile) */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <FilterPanel filters={filters} onChange={setFilters} activeSlug={activeSlug} />
        </div>

        <div>
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <p className="hidden text-sm text-neutral-500 sm:block">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </p>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden text-neutral-500 sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-brand"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="discount">Biggest discount</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          {/* Grid */}
          {visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-20 text-center">
              <p className="font-semibold">No products match your filters</p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="mt-3 text-sm font-semibold text-brand-dark hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}