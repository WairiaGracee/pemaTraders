import { Link, NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { adminFetchOrders } from "@/lib/admin";
import { SHOP } from "@/lib/config";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
];

export default function AdminLayout() {
  const { profile } = useAuth();
  const { data: orders } = useQuery({ queryKey: ["admin-orders"], queryFn: adminFetchOrders });
  const pending = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <span className="text-lg font-extrabold">
            <span className="text-brand">{SHOP.name}</span> Admin
          </span>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-neutral-300 sm:block">{profile?.full_name}</span>
            <Link to="/" className="flex items-center gap-1.5 hover:text-brand">
              <Store size={16} /> View store
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl gap-8 px-4 py-6 lg:grid lg:grid-cols-[210px_1fr]">
        <nav className="mb-6 flex gap-2 overflow-x-auto lg:mb-0 lg:flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand text-ink" : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
              {label === "Orders" && pending > 0 && (
                <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}