import { useSearchParams } from "react-router-dom";
import { products } from "@/data/mock";
import ProductListing from "@/components/product/ProductListing";

export default function Shop() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();

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