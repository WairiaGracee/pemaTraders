import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, LogOut, Package, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { supabase } from "@/lib/supabase";
import { getMyOrders } from "@/lib/orders";
import { formatKES } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

function Orders({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders(userId)
      .then(setOrders)
      .catch(() => setError("Could not load your orders."));
  }, [userId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!orders) return <p className="text-neutral-500">Loading your orders...</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
        <Package size={36} className="mx-auto text-neutral-300" />
        <p className="mt-3 font-semibold">No orders yet</p>
        <Link to="/shop" className="mt-2 inline-block text-sm font-semibold text-brand-dark hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">{o.code}</p>
              <p className="text-xs text-neutral-500">
                {new Date(o.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[o.status]}`}>
              {statusLabel[o.status]}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {o.items.slice(0, 4).map((i) => (
              <img key={i.productId} src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
            ))}
            {o.items.length > 4 && <span className="text-sm text-neutral-500">+{o.items.length - 4}</span>}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
            <span className="font-bold">{formatKES(o.total)}</span>
            <Link to={`/order-success/${o.id}`} className="text-sm font-semibold text-brand-dark hover:underline">
              View details
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand";

function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [msg, setMsg] = useState("");

  const {
    register, handleSubmit, formState: { isSubmitting },
  } = useForm({
    defaultValues: { full_name: profile?.full_name ?? "", phone: profile?.phone ?? "" },
  });

  const onSubmit = async (v: { full_name: string; phone: string }) => {
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: v.full_name.trim(), phone: v.phone.trim() })
      .eq("id", user!.id);
    if (error) {
      setMsg("Could not save your changes. Please try again.");
    } else {
      await refreshProfile();
      setMsg("Saved!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Email</span>
        <input value={user?.email ?? ""} disabled className={`${input} bg-neutral-100 text-neutral-500`} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Full name</span>
        <input {...register("full_name")} className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Phone</span>
        <input {...register("phone")} className={input} inputMode="tel" />
      </label>

      {msg && <p className={`text-sm ${msg === "Saved!" ? "text-green-600" : "text-red-600"}`}>{msg}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Save changes
      </button>
    </form>
  );
}

export default function Account() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const navigate = useNavigate();
const [confirmOut, setConfirmOut] = useState(false);
const [signingOut, setSigningOut] = useState(false);

const handleSignOut = async () => {
  setSigningOut(true);
  await signOut();
  setConfirmOut(false);
  setSigningOut(false);
  navigate("/");
};

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
      active ? "border-brand text-ink" : "border-transparent text-neutral-500 hover:text-ink"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">
            Hi, {profile?.full_name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-neutral-500">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          {profile?.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-brand hover:text-ink"
            >
              <ShieldCheck size={16} /> Admin portal
            </Link>
          )}
          <button
            onClick={() => setConfirmOut(true)}
            className="flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:border-red-500 hover:text-red-600"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <ConfirmDialog
  open={confirmOut}
  title="Sign out?"
  message="Are you sure you want to sign out of your account?"
  confirmLabel="Sign out"
  loading={signingOut}
  onConfirm={handleSignOut}
  onCancel={() => setConfirmOut(false)}
/>
      </div>

      <div className="mb-6 flex border-b border-neutral-200">
        <button onClick={() => setTab("orders")} className={tabClass(tab === "orders")}>
          <Package size={16} /> My orders
        </button>
        <button onClick={() => setTab("profile")} className={tabClass(tab === "profile")}>
          <UserIcon size={16} /> Profile
        </button>
      </div>

      {tab === "orders" ? <Orders userId={user!.id} /> : <ProfileForm />}
    </div>
  );
}