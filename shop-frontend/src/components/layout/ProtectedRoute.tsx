import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="py-24 text-center text-neutral-500">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && profile?.role !== "admin") return <Navigate to="/account" replace />;

  return <Outlet />;
}