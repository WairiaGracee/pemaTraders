import { CreditCard, Headset, ShieldCheck,  Store } from "lucide-react";

const items = [
  { icon: Store, title: "Easy pickup", text: "Order online, collect from our shop" },
  { icon: CreditCard, title: "Pay with M-Pesa", text: "Easy, secure checkout" },
  { icon: ShieldCheck, title: "Quality guaranteed", text: "Genuine products, warranty included" },
  { icon: Headset, title: "Friendly support", text: "Call or WhatsApp us anytime" },
];

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <div className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <Icon className="shrink-0 text-brand" size={30} />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-neutral-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}