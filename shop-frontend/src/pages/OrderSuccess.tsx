import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getOrder } from "@/lib/orders";
import { formatKES } from "@/lib/format";
import { SHOP } from "@/lib/config";
import type { Order } from "@/types/order";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOrder(id).then((o) => {
      setOrder(o);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) return <div className="py-24 text-center text-neutral-500">Loading...</div>;

  if (!order) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-brand-dark hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const waText = `Hello ${SHOP.name}, I just placed order ${order.code}.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <CheckCircle2 size={56} className="mx-auto text-green-500" />
        <h1 className="mt-4 text-3xl font-extrabold">Thank you, {order.customer.name.split(" ")[0]}!</h1>
        <p className="mt-2 text-neutral-500">
          Your order {order.code} has been received. We'll contact you on{" "}
          <strong className="text-ink">+{order.customer.phone}</strong> to confirm.
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
        <ul className="space-y-3">
          {order.items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 text-sm">
              <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <span className="flex-1">
                {i.name} <span className="text-neutral-400">x{i.qty}</span>
              </span>
              <span className="font-medium">{formatKES(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatKES(order.total)}</span>
          </div>
          <div className="flex justify-between pt-2 text-lg font-extrabold">
            <dt>Total</dt>
            <dd>{formatKES(order.total)}</dd>
          </div>
        </dl>

        <div className="grid gap-4 border-t border-neutral-200 pt-4 text-sm sm:grid-cols-2">
  <div>
    <h3 className="font-semibold">Collect from</h3>
    <p className="mt-1 text-neutral-600">{SHOP.address}</p>
    <p className="text-neutral-600">{SHOP.hours}</p>
  </div>
  <div>
    <h3 className="font-semibold">Payment</h3>
    <p className="mt-1 text-neutral-600">
      {order.payment.method === "mpesa" ? "M-Pesa" : "Pay at the shop"} (pending)
    </p>
  </div>
</div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-green-500 px-7 py-3 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
        >
          <MessageCircle size={18} /> Message us on WhatsApp
        </a>
        <Link
          to="/shop"
          className="rounded-full bg-brand px-7 py-3 text-center font-semibold text-ink transition hover:bg-brand-dark hover:text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}