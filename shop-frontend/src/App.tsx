import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Category from "@/pages/Category";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import AdminLayout from "@/pages/Admin/AdminLayout";
import Dashboard from "@/pages/Admin/Dashboard";
import AdminOrders from "@/pages/Admin/Orders";
import AdminProducts from "@/pages/Admin/Products";
import ProductForm from "@/pages/Admin/ProductForm";
import ProductDetail from "@/pages/ProductDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<div className="p-20 text-center">Page coming soon</div>} />
      </Route>

      <Route element={<ProtectedRoute admin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
        </Route>
      </Route>
    </Routes>
  );
}