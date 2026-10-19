import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import PromoBanners from "@/components/home/PromoBanners";
import TrustBar from "@/components/home/TrustBar";
import { categories, products } from "@/data/mock";

export default function Home() {
  const rows = ["tvs-stands", "wall-units", "furniture", "carpets", "bedding", "electronics"];

  return (
    <>
      <Hero />
      <CategoryGrid />
      {rows.slice(0, 3).map((slug) => (
        <ProductRow
          key={slug}
          title={categories.find((c) => c.slug === slug)!.name}
          categorySlug={slug}
          products={products.filter((p) => p.category === slug)}
        />
      ))}
      <PromoBanners />
      {rows.slice(3).map((slug) => (
        <ProductRow
          key={slug}
          title={categories.find((c) => c.slug === slug)!.name}
          categorySlug={slug}
          products={products.filter((p) => p.category === slug)}
        />
      ))}
      <TrustBar />
    </>
  );
}