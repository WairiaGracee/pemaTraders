import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, Clock, Loader2, MapPin, Smartphone, Store } from "lucide-react";
import { useCart, selectSubtotal } from "@/store/cartStore";
import { formatKES, normalizePhone } from "@/lib/format";
import { SHOP } from "@/lib/config";
import { placeOrder } from "@/lib/orders";

const phoneRe = /^(?:\+?254|0)?[17]\d{8}$/;

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    phone: z.string().trim().regex(phoneRe, "Enter a valid Kenyan phone number"),
    email: z.string().trim().email("Enter a valid email").or(z.literal("")),
    notes: z.string(),
    payment: z.enum(["mpesa", "shop"]),
    mpesaPhone: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.payment === "mpesa" && !phoneRe.test((v.mpesaPhone || v.phone).trim())) {
      ctx.addIssue({ code: "custom", path: ["mpesaPhone"], message: "Enter a valid M-Pesa number" });
    }
  });

type FormValues = z.infer<typeof schema>;

const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm text-ink">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionCard({
  checked, icon: Icon, title, text, children,
}: {
  checked: boolean;
  icon: React.ElementType;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        checked ? "border-brand bg-brand/5" : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      {children}
      <Icon size={22} className="mt-0.5 shrink-0 text-brand-dark" />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-neutral-500">{text}</span>
      </span>
    </label>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const total = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);
  const placed = useRef(false);
  const { user, profile } = useAuth();
  const [submitError, setSubmitError] = useState("");

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", notes: "", payment: "mpesa", mpesaPhone: "" },
  });

  const payment = watch("payment");
  useEffect(() => {
  if (!profile) return;
  setValue("name", profile.full_name ?? "");
  setValue("phone", profile.phone ?? "");
  setValue("email", user?.email ?? "");
}, [profile, user, setValue]);

  if (items.length === 0 && !placed.current) return <Navigate to="/cart" replace />;

  const onSubmit = async (v: FormValues) => {
  setSubmitError("");
  try {
    const order = await placeOrder({
      customer: { name: v.name.trim(), phone: normalizePhone(v.phone), email: v.email || undefined },
      notes: v.notes.trim() || undefined,
      payment: {
        method: v.payment,
        mpesaPhone: v.payment === "mpesa" ? normalizePhone(v.mpesaPhone || v.phone) : undefined,
      },
      items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
    });

    placed.current = true;
    navigate(`/order-success/${order.id}`);
    clear();
  } catch (e) {
    const msg = (e as { message?: string })?.message ?? "";
    setSubmitError(
      /stock|available/i.test(msg)
        ? msg
        : "We couldn't place your order. Please check your connection and try again."
    );
  }
};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
        <Link to="/" className="hover:text-brand-dark">Home</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-brand-dark">Cart</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-ink">Checkout</span>
      </nav>
      <h1 className="mb-6 text-3xl font-extrabold">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* 1. Contact */}
          <Section n={1} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message}>
                <input {...register("name")} className={input} placeholder="Jane Wanjiku" autoComplete="name" />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <input {...register("phone")} className={input} placeholder="0712 345 678" inputMode="tel" autoComplete="tel" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email (optional)" error={errors.email?.message}>
                  <input {...register("email")} className={input} placeholder="you@example.com" autoComplete="email" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Notes (optional)">
                  <textarea {...register("notes")} rows={2} className={input} placeholder="Anything we should know about your order?" />
                </Field>
              </div>
            </div>
          </Section>

          {/* 2. Pickup */}
          <Section n={2} title="Collect from our shop">
            <div className="flex gap-4 rounded-xl border border-brand bg-brand/5 p-4">
              <Store size={24} className="mt-0.5 shrink-0 text-brand-dark" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">In-store pickup</p>
                <p className="flex items-center gap-2 text-neutral-600">
                  <MapPin size={15} className="shrink-0" /> {SHOP.address}
                </p>
                <p className="flex items-center gap-2 text-neutral-600">
                  <Clock size={15} className="shrink-0" /> {SHOP.hours}
                </p>
                <p className="text-neutral-500">
                  We'll call you when your order is ready. Please bring your order number.
                </p>
              </div>
            </div>
          </Section>

          {/* 3. Payment */}
          <Section n={3} title="Payment">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard checked={payment === "mpesa"} icon={Smartphone} title="M-Pesa" text="Pay from your phone (STK push)">
                <input type="radio" value="mpesa" {...register("payment")} className="mt-1 accent-[#d99a00]" />
              </OptionCard>
              <OptionCard checked={payment === "shop"} icon={Store} title="Pay at the shop" text="Cash or M-Pesa when you collect">
                <input type="radio" value="shop" {...register("payment")} className="mt-1 accent-[#d99a00]" />
              </OptionCard>
            </div>

            {payment === "mpesa" && (
              <div className="mt-5">
                <Field label="M-Pesa number" error={errors.mpesaPhone?.message}>
                  <input
                    {...register("mpesaPhone")}
                    className={input}
                    inputMode="tel"
                    placeholder="Leave blank to use your phone number"
                  />
                </Field>
                <p className="mt-2 text-xs text-neutral-500">
                  Live M-Pesa payment prompts are coming soon. For now, we'll confirm your order and send payment details.
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-40">
          <h2 className="text-lg font-bold">Order summary</h2>

          <ul className="mt-4 max-h-64 space-y-3 overflow-auto pr-1">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 text-sm">
                <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <span className="flex-1 leading-snug">
                  {product.name} <span className="text-neutral-400">x{qty}</span>
                </span>
                <span className="font-medium">{formatKES(product.price * qty)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-between border-t border-neutral-200 pt-5 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatKES(total)}</span>
          </div>
            {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            Place order
          </button>
          <p className="mt-3 text-center text-xs text-neutral-500">
            By placing your order you agree to our terms.
          </p>
        </aside>
      </form>
    </div>
  );
}