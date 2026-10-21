import { Link } from "react-router-dom";
import {
  BedDouble, Lamp, Layers, Library, Smartphone, Sofa, Tv, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useCategories } from "@/hooks/useCatalog";

const icons: Record<string, LucideIcon> = {
  electronics: Smartphone,
  "tvs-stands": Tv,
  "wall-units": Library,
  furniture: Sofa,
  carpets: Layers,
  bedding: BedDouble,
  kitchen: UtensilsCrossed,
  lighting: Lamp,
};

export default function CategoryGrid() {
  const { categories } = useCategories();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <h2 className="text-2xl font-bold">Shop popular categories</h2>
      <p className="mb-6 text-sm text-neutral-500">Find exactly what your home needs</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((c) => {
          const Icon = icons[c.slug] ?? Sofa;
          return (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-center transition hover:border-brand hover:shadow-md"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                <Icon size={26} />
              </span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}