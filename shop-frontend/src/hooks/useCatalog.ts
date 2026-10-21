import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProducts } from "@/lib/catalog";
import type { Category, Product } from "@/types/product";

const NO_CATEGORIES: Category[] = [];
const NO_PRODUCTS: Product[] = [];

export function useCategories() {
  const q = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 5 * 60_000 });
  return { categories: q.data ?? NO_CATEGORIES, isLoading: q.isLoading };
}

export function useProducts() {
  const q = useQuery({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 60_000 });
  return { products: q.data ?? NO_PRODUCTS, isLoading: q.isLoading };
}