import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, Clock, Package, ShoppingBag, type LucideIcon } from "lucide-react";
import { adminFetchOrders, adminFetchProducts } from "@/lib/admin";
import { formatKES } from "@/lib/format";
import { statusLabel, statusStyle } from "@/lib/orderStatus";

const dayKey = (d: Date) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

function Stat({
  icon: Icon, label, value, hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-3 text-sm text-neutral-500">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand-dark">
          <Icon size={18} />
        </span>
        {label}
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: adminFetchOrders });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: adminFetchProducts });

  if (orders.isLoading || products.isLoading) return <p className="text-neutral-500">Loading...</p>;
  if (orders.error || products.error || !orders.data || !products.data) {
    return <p className="text-red-600">Could not load the dashboard. Make sure you are signed in as an admin.</p>;
  }

  const allOrders = orders.data;
  const allProducts = products.data;

  const valid = allOrders.filter((o) => o.status !== "cancelled");
  const monthAgo = Date.now() - 30 * 864e5;
  const lastMonth = valid.filter((o) => new Date(o.createdAt).getTime() >= monthAgo);
  const revenue = lastMonth.reduce((n, o) => n + o.total, 0);
  const pending = allOrders.filter((o) => o.status === "pending").length;
  const activeProducts = allProducts.filter((p) => p.active);
  const lowStock = activeProducts.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  // Last 14 days of revenue
  const byDay = new Map<string, number>();
  valid.forEach((o) => {
    const k = dayKey(new Date(o.createdAt));
    byDay.set(k, (byDay.get(k) ?? 0) + o.total);
  });
  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { date: d, total: byDay.get(dayKey(d)) ?? 0 };
  });
  const max = Math.max(...series.map((s) => s.total), 1);

  // Top sellers
  const sold = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
  valid.forEach((o) =>
    o.items.forEach((i) => {
      const cur = sold.get(i.productId) ?? { name: i.name, image: i.image, qty: 0, revenue: 0 };
      cur.qty += i.qty;
      cur.revenue += i.price * i.qty;
      sold.set(i.productId, cur);
    })
  );
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Banknote} label="Revenue (30 days)" value={formatKES(revenue)} hint="Excludes cancelled orders" />
        <Stat icon={ShoppingBag} label="Orders (30 days)" value={String(lastMonth.length)} hint={`${allOrders.length} all time`} />
        <Stat icon={Clock} label="Awaiting action" value={String(pending)} hint="Pending orders" />
        <Stat
          icon={Package}
          label="Active products"
          value={String(activeProducts.length)}
          hint={lowStock.length ? `${lowStock.length} low or out of stock` : "Stock levels look good"}
        />
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-bold">Revenue, last 14 days</h2>
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {series.map((s) => (
            <div
              key={dayKey(s.date)}
              title={`${s.date.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}: ${formatKES(s.total)}`}
              className="flex-1 rounded-t bg-brand/80 transition hover:bg-brand"
              style={{ height: `${Math.max((s.total / max) * 100, 2)}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex gap-1.5 text-[10px] text-neutral-400">
          {series.map((s) => (
            <span key={dayKey(s.date)} className="flex-1 text-center">
              {s.date.getDate()}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-dark hover:underline">
              View all
            </Link>
          </div>
          {allOrders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {allOrders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{o.code}</p>
                    <p className="truncate text-xs text-neutral-500">{o.customer.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                  <span className="font-bold">{formatKES(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-bold">Top sellers</h2>
          {top.length === 0 ? (
            <p className="text-sm text-neutral-500">Sales will show up here once orders come in.</p>
          ) : (
            <ul className="space-y-3">
              {top.map((t) => (
                <li key={t.name} className="flex items-center gap-3 text-sm">
                  <img src={t.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="flex-1 leading-snug">{t.name}</span>
                  <span className="text-neutral-500">{t.qty} sold</span>
                  <span className="font-semibold">{formatKES(t.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle size={18} /> Low stock
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {lowStock.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm hover:shadow"
                >
                  <span className="truncate">{p.name}</span>
                  <span className={`ml-3 font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}