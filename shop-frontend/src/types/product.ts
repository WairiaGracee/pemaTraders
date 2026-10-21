export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string; // category slug
  price: number;
  compareAtPrice?: number;
  image: string;
  stock: number;
  inStock: boolean;
  active: boolean;
}

export interface Category {
  slug: string;
  name: string;
  description?: string;
}