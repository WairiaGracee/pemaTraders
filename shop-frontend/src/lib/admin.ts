import { supabase } from "./supabase";
import { fromRow, type Row } from "./orders";
import { toProduct, type ProductRow } from "./catalog";
import type { Order, OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";

export interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  active: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const toRow = (i: ProductInput) => ({
  name: i.name,
  description: i.description,
  category: i.category,
  price: i.price,
  compare_at_price: i.compareAtPrice,
  stock: i.stock,
  image: i.image,
  active: i.active,
});

/* ---------- Products ---------- */

export async function adminFetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .order("name");
  if (error) throw error;
  return (data as ProductRow[]).map(toProduct);
}

export async function adminGetProduct(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function createProduct(i: ProductInput): Promise<void> {
  const slug = `${slugify(i.name) || "product"}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from("products").insert({ slug, ...toRow(i) });
  if (error) throw error;
}

export async function updateProduct(id: string, i: ProductInput): Promise<void> {
  const { error } = await supabase.from("products").update(toRow(i)).eq("id", id);
  if (error) throw error;
}

export async function patchProduct(
  id: string,
  patch: { active?: boolean; stock?: number }
): Promise<void> {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

async function shrink(file: File, max = 1400): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process the image"))),
      "image/jpeg",
      0.85
    )
  );
}

export async function uploadProductImage(file: File): Promise<string> {
  const blob = await shrink(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

/* ---------- Orders ---------- */

export async function adminFetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; paymentStatus?: "pending" | "paid" }
): Promise<void> {
  const update: Record<string, string> = {};
  if (patch.status) update.status = patch.status;
  if (patch.paymentStatus) update.payment_status = patch.paymentStatus;
  const { error } = await supabase.from("orders").update(update).eq("id", id);
  if (error) throw error;
}