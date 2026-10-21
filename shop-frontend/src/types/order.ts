export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string; email?: string };
  notes?: string;
  payment: { method: "mpesa" | "shop"; mpesaPhone?: string; status: "pending" | "paid" };
  items: OrderItem[];
  total: number;
}