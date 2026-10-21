import { supabase } from "./supabase";
import type { Order } from "@/types/order";

export type Row = {
  id: string;
  code: string;
  status: Order["status"];
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  payment_method: "mpesa" | "shop";
  payment_status: "pending" | "paid";
  mpesa_phone: string | null;
  items: Order["items"];
  total: number;
};

export const fromRow = (r: Row): Order => ({
  id: r.id,
  code: r.code,
  createdAt: r.created_at,
  status: r.status,
  customer: {
    name: r.customer_name,
    phone: r.customer_phone,
    email: r.customer_email ?? undefined,
  },
  notes: r.notes ?? undefined,
  payment: {
    method: r.payment_method,
    mpesaPhone: r.mpesa_phone ?? undefined,
    status: r.payment_status,
  },
  items: r.items,
  total: r.total,
});

export interface NewOrder {
  customer: { name: string; phone: string; email?: string };
  notes?: string;
  payment: { method: "mpesa" | "shop"; mpesaPhone?: string };
  items: { productId: string; qty: number }[];
}

export async function placeOrder(o: NewOrder): Promise<Order> {
  const { data, error } = await supabase.rpc("place_order", {
    p_name: o.customer.name,
    p_phone: o.customer.phone,
    p_email: o.customer.email ?? null,
    p_notes: o.notes ?? null,
    p_payment_method: o.payment.method,
    p_mpesa_phone: o.payment.mpesaPhone ?? null,
    p_items: o.items,
  });
  if (error) throw error;
  return fromRow(data as Row);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase.rpc("get_order", { p_id: id });
  if (error || !data || !(data as Row).id) return undefined;
  return fromRow(data as Row);
}

export async function getMyOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}