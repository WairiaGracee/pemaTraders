import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<div className="p-20 text-center">Page coming soon</div>} />
      </Route>
    </Routes>
  );
}
