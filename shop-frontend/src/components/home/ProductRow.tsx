import { Link } from "react-router-dom";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  title: string;
  categorySlug: string;
  products: Product[];
}

export default function ProductRow({ title, categorySlug, products }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={`/category/${categorySlug}`} className="text-sm font-semibold text-brand-dark hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}