import { Link, useParams } from "react-router-dom";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import ProductListing from "@/components/product/ProductListing";

export default function Category() {
  const { slug } = useParams();
  const { categories, isLoading: loadingCategories } = useCategories();
  const { products, isLoading: loadingProducts } = useProducts();

  if (loadingCategories || loadingProducts) {
    return <div className="py-24 text-center text-neutral-500">Loading...</div>;
  }

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-brand-dark hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <ProductListing
      key={category.slug}
      title={category.name}
      description={category.description}
      activeSlug={category.slug}
      crumbs={[{ label: "Home", to: "/" }, { label: category.name }]}
      items={products.filter((p) => p.category === category.slug)}
    />
  );
}