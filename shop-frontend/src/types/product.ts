export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // category slug
  price: number;
  compareAtPrice?: number;
  image: string;
  inStock: boolean;
}

export interface Category {
  slug: string;
  name: string;
  description?: string;
}