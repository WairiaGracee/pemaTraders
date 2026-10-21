import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import PromoBanners from "@/components/home/PromoBanners";
import TrustBar from "@/components/home/TrustBar";
import { useCategories, useProducts } from "@/hooks/useCatalog";

export default function Home() {
  const { categories } = useCategories();
  const { products, isLoading } = useProducts();

  // One row per category that has products, up to six
  const rows = categories
    .map((c) => ({ c, items: products.filter((p) => p.category === c.slug) }))
    .filter((r) => r.items.length > 0)
    .slice(0, 6);

  return (
    <>
      <Hero />
      <CategoryGrid />
      {isLoading && <p className="py-16 text-center text-neutral-500">Loading products...</p>}
      {rows.slice(0, 3).map(({ c, items }) => (
        <ProductRow key={c.slug} title={c.name} categorySlug={c.slug} products={items} />
      ))}
      <PromoBanners />
      {rows.slice(3).map(({ c, items }) => (
        <ProductRow key={c.slug} title={c.name} categorySlug={c.slug} products={items} />
      ))}
      <TrustBar />
    </>
  );
}