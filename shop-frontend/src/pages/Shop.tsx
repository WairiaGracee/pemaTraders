import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useCatalog";
import ProductListing from "@/components/product/ProductListing";

export default function Shop() {
  const [params] = useSearchParams();
  const { products, isLoading } = useProducts();
  const q = (params.get("q") ?? "").trim().toLowerCase();

  if (isLoading) return <div className="py-24 text-center text-neutral-500">Loading...</div>;

  const items = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;

  return (
    <ProductListing
      key={q}
      title={q ? `Results for "${params.get("q")}"` : "All products"}
      description={q ? undefined : "Everything we sell, in one place."}
      crumbs={[{ label: "Home", to: "/" }, { label: q ? "Search" : "All products" }]}
      items={items}
    />
  );
}