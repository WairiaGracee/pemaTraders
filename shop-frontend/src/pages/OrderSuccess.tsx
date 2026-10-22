import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, MessageCircle, Smartphone, XCircle } from "lucide-react";
import { getOrder } from "@/lib/orders";
import { getPaymentStatus, startMpesaPayment } from "@/lib/payments";
import { formatKES } from "@/lib/format";
import { SHOP } from "@/lib/config";
import type { Order } from "@/types/order";

type Phase = "idle" | "sending" | "waiting" | "failed" | "timeout";

const friendly = (desc?: string) => {
  const s = (desc ?? "").toLowerCase();
  if (s.includes("cancel")) return "The payment was cancelled on your phone.";
  if (s.includes("insufficient") || s.includes("balance")) return "Your M-Pesa balance was too low.";
  if (s.includes("timeout") || s.includes("reach")) return "We couldn't reach your phone, or the prompt timed out.";
  return "The payment didn't go through.";
};

const primaryBtn =
  "mt-5 rounded-full bg-brand px-7 py-3 font-semibold text-ink transition hover:bg-brand-dark hover:text-white";
const secondaryBtn =
  "mt-5 rounded-full border border-neutral-300 px-7 py-3 font-semibold transition hover:bg-neutral-100";

function MpesaPanel({
  order, autoStart, onPaid,
}: {
  order: Order;
  autoStart: boolean;
  onPaid: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  const send = useCallback(async () => {
    setPhase("sending");
    setMessage("");
    try {
      await startMpesaPayment(order.id);
      setPhase("waiting");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send the M-Pesa prompt.");
      setPhase("failed");
    }
  }, [order.id]);

  // Straight after checkout, send the prompt. On a later visit, resume if one is already pending.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (autoStart) {
      send();
    } else {
      getPaymentStatus(order.id).then((p) => {
        if (p?.status === "pending") setPhase("waiting");
      });
    }
  }, [autoStart, order.id, send]);

  // While waiting, check every 3 seconds for up to 90 seconds
  useEffect(() => {
    if (phase !== "waiting") return;
    let cancelled = false;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const p = await getPaymentStatus(order.id);
      if (cancelled) return;
      if (p?.status === "success") {
        clearInterval(timer);
        onPaid();
      } else if (p?.status === "failed") {
        clearInterval(timer);
        setMessage(friendly(p.message));
        setPhase("failed");
      } else if (tries >= 30) {
        clearInterval(timer);
        setPhase("timeout");
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [phase, order.id, onPaid]);

  const number = order.payment.mpesaPhone ? `+${order.payment.mpesaPhone}` : "your phone";

  return (
    <div className="mt-8 rounded-xl border border-brand bg-brand/5 p-6 text-center">
      {phase === "failed" ? (
        <XCircle size={36} className="mx-auto text-red-500" />
      ) : phase === "sending" || phase === "waiting" ? (
        <Loader2 size={36} className="mx-auto animate-spin text-brand-dark" />
      ) : (
        <Smartphone size={36} className="mx-auto text-brand-dark" />
      )}

      {phase === "idle" && (
        <>
          <h2 className="mt-3 text-lg font-bold">Pay {formatKES(order.total)} with M-Pesa</h2>
          <p className="mt-1 text-sm text-neutral-600">We'll send a payment prompt to {number}.</p>
          <button onClick={send} className={primaryBtn}>Send M-Pesa prompt</button>
        </>
      )}

      {phase === "sending" && <h2 className="mt-3 text-lg font-bold">Sending the prompt...</h2>}

      {phase === "waiting" && (
        <>
          <h2 className="mt-3 text-lg font-bold">Check your phone</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Enter your M-Pesa PIN on the prompt sent to {number}. Please keep this page open.
          </p>
        </>
      )}

      {phase === "failed" && (
        <>
          <h2 className="mt-3 text-lg font-bold">Payment not completed</h2>
          <p className="mt-1 text-sm text-neutral-600">{message}</p>
          <button onClick={send} className={primaryBtn}>Try again</button>
        </>
      )}

      {phase === "timeout" && (
        <>
          <h2 className="mt-3 text-lg font-bold">Still waiting for confirmation</h2>
          <p className="mt-1 text-sm text-neutral-600">
            If you already entered your PIN, it may still be processing. Check your M-Pesa SMS, then tap "Check again".
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setPhase("waiting")} className={primaryBtn}>Check again</button>
            <button onClick={send} className={secondaryBtn}>Send a new prompt</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const autoPay = (location.state as { pay?: boolean } | null)?.pay === true;

  const [order, setOrder] = useState<Order | undefined>();
  const [receipt, setReceipt] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const o = await getOrder(id);
    setOrder(o);
    if (o?.payment.status === "paid" && o.payment.method === "mpesa") {
      const p = await getPaymentStatus(id);
      setReceipt(p?.receipt);
    }
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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

  const paid = order.payment.status === "paid";
  const needsPayment = order.payment.method === "mpesa" && !paid && order.status !== "cancelled";
  const waText = `Hello ${SHOP.name}, I just placed order ${order.code}.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <CheckCircle2 size={56} className="mx-auto text-green-500" />
        <h1 className="mt-4 text-3xl font-extrabold">Thank you, {order.customer.name.split(" ")[0]}!</h1>
        <p className="mt-2 text-neutral-500">
          Your order <strong className="text-ink">{order.code}</strong> has been received. We'll call you on{" "}
          <strong className="text-ink">+{order.customer.phone}</strong> when it's ready for collection.
        </p>
        {paid && order.payment.method === "mpesa" && (
          <p className="mt-4 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
            Payment received{receipt ? ` · M-Pesa code ${receipt}` : ""}
          </p>
        )}
      </div>

      {needsPayment && <MpesaPanel order={order} autoStart={autoPay} onPaid={load} />}

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

        <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-extrabold">
          <span>Total</span>
          <span>{formatKES(order.total)}</span>
        </div>

        <div className="grid gap-4 border-t border-neutral-200 pt-4 text-sm sm:grid-cols-2">
          <div>
            <h3 className="font-semibold">Collect from</h3>
            <p className="mt-1 text-neutral-600">{SHOP.address}</p>
            <p className="text-neutral-600">{SHOP.hours}</p>
          </div>
          <div>
            <h3 className="font-semibold">Payment</h3>
            <p className="mt-1 text-neutral-600">
              {order.payment.method === "mpesa" ? "M-Pesa" : "Pay at the shop"} ({paid ? "paid" : "pending"})
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