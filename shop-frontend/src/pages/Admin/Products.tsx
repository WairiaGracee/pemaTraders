import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { adminFetchProducts, deleteProduct, patchProduct } from "@/lib/admin";
import { useCategories } from "@/hooks/useCatalog";
import { formatKES } from "@/lib/format";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Product } from "@/types/product";

export default function AdminProducts() {
  const qc = useQueryClient();
  const { categories } = useCategories();
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminFetchProducts,
  });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const patch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { active?: boolean; stock?: number } }) =>
      patchProduct(id, data),
    onSuccess: () => {
      setMsg("");
      refresh();
    },
    onError: () => setMsg("Could not save that change. Please try again."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      setMsg("");
      setToDelete(null);
      refresh();
    },
    onError: () => {
      setToDelete(null);
      setMsg("Could not delete the product. Please try again.");
    },
  });

  if (isLoading) return <p className="text-neutral-500">Loading products...</p>;
  if (error || !products) return <p className="text-red-600">Could not load products.</p>;

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const term = q.trim().toLowerCase();
  const shown = products.filter(
    (p) => (cat === "all" || p.category === cat) && (!term || p.name.toLowerCase().includes(term))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">
          Products <span className="text-lg font-medium text-neutral-400">({products.length})</span>
        </h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark hover:text-white"
        >
          <Plus size={18} /> Add product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-4 pr-10 text-sm outline-none focus:border-brand"
          />
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {shown.map((p) => (
              <tr key={p.id} className={p.active ? "" : "bg-neutral-50 text-neutral-400"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-medium text-inherit">{p.name}</p>
                      {!p.active && <p className="text-xs">Hidden from shop</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{catName(p.category)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{formatKES(p.price)}</p>
                  {p.compareAtPrice && (
                    <p className="text-xs line-through">{formatKES(p.compareAtPrice)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input
                    key={`${p.id}-${p.stock}`}
                    type="number"
                    min={0}
                    defaultValue={p.stock}
                    aria-label={`Stock for ${p.name}`}
                    onBlur={(e) => {
                      const n = Math.max(0, Math.floor(Number(e.target.value)));
                      if (Number.isFinite(n) && n !== p.stock) patch.mutate({ id: p.id, data: { stock: n } });
                    }}
                    className={`w-20 rounded-lg border px-2 py-1.5 text-center outline-none focus:border-brand ${
                      p.stock === 0
                        ? "border-red-300 bg-red-50 text-red-700"
                        : p.stock <= 5
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-neutral-300 bg-white text-ink"
                    }`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1 text-neutral-600">
                    <button
                      onClick={() => patch.mutate({ id: p.id, data: { active: !p.active } })}
                      title={p.active ? "Hide from shop" : "Show in shop"}
                      className="rounded-lg p-2 hover:bg-neutral-100"
                    >
                      {p.active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      title="Edit"
                      className="rounded-lg p-2 hover:bg-neutral-100"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => setToDelete(p)}
                      title="Delete"
                      className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Tip: change a stock number and click away to save it. Use the eye icon to hide a product without deleting it.
      </p>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this product?"
        message={`"${toDelete?.name ?? ""}" will be removed permanently. Past orders keep their record. To just take it off the shop, use the eye icon instead.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}