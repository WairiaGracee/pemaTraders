import { Link } from "react-router-dom";

const banners = [
  { title: "Living room makeover", sub: "Sofas, wall units & TV stands", to: "/category/furniture", bg: "from-amber-700 to-amber-500" },
  { title: "Cosy bedroom deals", sub: "Duvets, sheets & pillows", to: "/category/bedding", bg: "from-slate-800 to-slate-600" },
  { title: "Fresh new carpets", sub: "Turkish, Persian & shaggy rugs", to: "/category/carpets", bg: "from-rose-800 to-rose-600" },
];

export default function PromoBanners() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-12 md:grid-cols-3">
      {banners.map((b) => (
        <Link
          key={b.title}
          to={b.to}
          className={`rounded-2xl bg-gradient-to-br ${b.bg} p-7 text-white transition hover:-translate-y-1 hover:shadow-xl`}
        >
          <h3 className="text-xl font-bold">{b.title}</h3>
          <p className="mt-1 text-sm text-white/80">{b.sub}</p>
          <span className="mt-6 inline-block text-sm font-semibold underline">Shop now</span>
        </Link>
      ))}
    </section>
  );
}