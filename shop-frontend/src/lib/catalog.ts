import { supabase } from "./supabase";
import type { Category, Product } from "@/types/product";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  image: string;
  stock: number;
  active: boolean;
};

export const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  category: r.category,
  price: r.price,
  compareAtPrice: r.compare_at_price ?? undefined,
  image: r.image,
  stock: r.stock,
  inStock: r.stock > 0,
  active: r.active,
});

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, description")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return (data as { slug: string; name: string; description: string | null }[]).map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
  }));
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .order("name");
  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}