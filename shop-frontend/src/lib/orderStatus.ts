import type { OrderStatus } from "@/types/order";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "ready", "completed", "cancelled"];

export const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-red-100 text-red-700",
};