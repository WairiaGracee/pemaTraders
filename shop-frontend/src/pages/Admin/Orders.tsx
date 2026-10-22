import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, MessageCircle, Phone, Search } from "lucide-react";
import { formatKES } from "@/lib/format";
import { ORDER_STATUSES, statusLabel, statusStyle } from "@/lib/orderStatus";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Order, OrderStatus } from "@/types/order";
import { adminFetchOrders, adminFetchReceipts, updateOrder } from "@/lib/admin";

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: adminFetchOrders,
    refetchInterval: 30_000,
  });
  const { data: receipts } = useQuery({
    queryKey: ["admin-receipts"],
    queryFn: adminFetchReceipts,
    refetchInterval: 30_000,
  });

  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");

  const mut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateOrder>[1] }) =>
      updateOrder(id, patch),
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-receipts"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] }); // cancelling returns stock
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => setMsg("Could not update the order. Please try again."),
  });

  if (isLoading) return <p className="text-neutral-500">Loading orders...</p>;
  if (error || !orders) return <p className="text-red-600">Could not load orders.</p>;

  const term = q.trim().toLowerCase();
  const shown = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (!term ||
        o.code.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.customer.phone.includes(term))
  );
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      active ? "bg-ink text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
    }`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Orders</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
              {statusLabel[s]} ({count(s)})
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code, name or phone"
            className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-4 pr-10 text-sm outline-none focus:border-brand"
          />
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
          No orders found.
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((o) => {
            const open = openId === o.id;
            const locked = o.status === "cancelled";
            const receipt = receipts?.[o.id];
            return (
              <li key={o.id} className="rounded-xl border border-neutral-200 bg-white">
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {o.code}
                      <span className="ml-2 text-xs font-normal text-neutral-500">
                        {new Date(o.createdAt).toLocaleString("en-KE", {
                          day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                    </p>
                    <p className="truncate text-sm text-neutral-600">
                      {o.customer.name} · +{o.customer.phone}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                  <span className="hidden font-bold sm:block">{formatKES(o.total)}</span>
                  <ChevronDown size={18} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="space-y-5 border-t border-neutral-100 p-4">
                    <ul className="space-y-3">
                      {o.items.map((i) => (
                        <li key={i.productId} className="flex items-center gap-3 text-sm">
                          <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                          <span className="flex-1">
                            {i.name} <span className="text-neutral-400">x{i.qty}</span>
                          </span>
                          <span className="font-medium">{formatKES(i.price * i.qty)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between border-t border-neutral-100 pt-3 font-extrabold">
                        <span>Total</span>
                        <span>{formatKES(o.total)}</span>
                      </li>
                    </ul>

                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <h3 className="font-semibold">Customer</h3>
                        <p className="mt-1 text-neutral-600">{o.customer.name}</p>
                        {o.customer.email && <p className="text-neutral-600">{o.customer.email}</p>}
                        <div className="mt-2 flex gap-2">
                          <a
                            href={`tel:+${o.customer.phone}`}
                            className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100"
                          >
                            <Phone size={13} /> Call
                          </a>
                          <a
                            href={`https://wa.me/${o.customer.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-full border border-green-500 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-500 hover:text-white"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">Payment</h3>
                        <p className="mt-1 text-neutral-600">
                          {o.payment.method === "mpesa" ? "M-Pesa" : "Pay at the shop"}
                          {o.payment.mpesaPhone && ` (+${o.payment.mpesaPhone})`}
                        </p>
                        <p className={`font-semibold ${o.payment.status === "paid" ? "text-green-600" : "text-amber-700"}`}>
                          {o.payment.status === "paid" ? "Paid" : "Not paid yet"}
                        </p>
                        {receipt && (
                          <p className="text-neutral-600">
                            M-Pesa code: <span className="font-semibold text-ink">{receipt}</span>
                          </p>
                        )}
                        {o.notes && (
                          <p className="mt-2 text-neutral-600">
                            <span className="font-semibold text-ink">Notes:</span> {o.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 border-t border-neutral-100 pt-4">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">Order status</span>
                        <select
                          value={o.status}
                          disabled={locked || mut.isPending}
                          onChange={(e) => {
                            const next = e.target.value as OrderStatus;
                            if (next === "cancelled") setToCancel(o);
                            else mut.mutate({ id: o.id, patch: { status: next } });
                          }}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-brand disabled:bg-neutral-100"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        disabled={locked || mut.isPending}
                        onClick={() =>
                          mut.mutate({
                            id: o.id,
                            patch: { paymentStatus: o.payment.status === "paid" ? "pending" : "paid" },
                          })
                        }
                        className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:border-brand hover:text-brand-dark disabled:opacity-50"
                      >
                        {o.payment.status === "paid" ? "Mark as unpaid" : "Mark as paid"}
                      </button>

                      {locked && (
                        <p className="text-xs text-neutral-500">Cancelled orders can't be changed.</p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this order?"
        message={`Order ${toCancel?.code ?? ""} will be cancelled and its items returned to stock. This can't be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loadingLabel="Cancelling..."
        loading={mut.isPending}
        onConfirm={() =>
          toCancel &&
          mut.mutate(
            { id: toCancel.id, patch: { status: "cancelled" } },
            { onSettled: () => setToCancel(null) }
          )
        }
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}