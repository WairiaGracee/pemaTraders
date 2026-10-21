import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { SHOP } from "@/lib/config";
import { useCategories } from "@/hooks/useCatalog";


export default function Footer() {
  const { categories } = useCategories();

  return (
    <footer className="mt-16 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-2xl font-extrabold text-brand">{SHOP.name}</h3>
          <p className="mt-3 text-sm">
            Quality electronics, furniture, carpets and bedding for every Kenyan home.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Help</h4>
          <ul className="space-y-2 text-sm">
            <li>Delivery & Returns</li>
            <li>How to order</li>
            <li>Payment options</li>
            <li>Contact us</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Visit our shop</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {SHOP.address}</li>
            <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0" /> {SHOP.hours}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" /> {SHOP.phone}</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" /> {SHOP.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {SHOP.name}. All rights reserved.
      </div>
    </footer>
  );
}