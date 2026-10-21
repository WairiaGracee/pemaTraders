import { Link } from "react-router-dom";
import { useCategories, useProducts } from "@/hooks/useCatalog";

export interface Filters {
  min: string;
  max: string;
  inStock: boolean;
  onSale: boolean;
}

export const defaultFilters: Filters = { min: "", max: "", inStock: false, onSale: false };

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  activeSlug?: string;
}

export default function FilterPanel({ filters, onChange, activeSlug }: Props) {
  const { categories } = useCategories();
  const { products } = useProducts();
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  return (
    <aside className="space-y-8 rounded-xl border border-neutral-200 bg-white p-5">
      {/* Categories */}
      <div>
        <h3 className="mb-3 font-semibold">Categories</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              to="/shop"
              className={`flex justify-between rounded px-2 py-1.5 hover:bg-neutral-100 ${
                !activeSlug ? "font-semibold text-brand-dark" : ""
              }`}
            >
              All products <span className="text-neutral-400">{products.length}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/category/${c.slug}`}
                className={`flex justify-between rounded px-2 py-1.5 hover:bg-neutral-100 ${
                  activeSlug === c.slug ? "font-semibold text-brand-dark" : ""
                }`}
              >
                {c.name}
                <span className="text-neutral-400">
                  {products.filter((p) => p.category === c.slug).length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 font-semibold">Price (KES)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.min}
            onChange={(e) => onChange({ ...filters, min: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <span className="text-neutral-400">-</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.max}
            onChange={(e) => onChange({ ...filters, max: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3 text-sm">
        <h3 className="font-semibold">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ ...filters, inStock: e.target.checked })}
            className="h-4 w-4 accent-[#d99a00]"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => onChange({ ...filters, onSale: e.target.checked })}
            className="h-4 w-4 accent-[#d99a00]"
          />
          On sale
        </label>
      </div>

      {hasFilters && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="w-full rounded-lg border border-neutral-300 py-2 text-sm font-medium hover:border-brand hover:text-brand-dark"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}