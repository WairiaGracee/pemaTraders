import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { normalizePhone } from "@/lib/format";

const phoneRe = /^(?:\+?254|0)?[17]\d{8}$/;

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    phone: z.string().trim().regex(phoneRe, "Enter a valid Kenyan phone number"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

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

export default function Register() {
  const { user, loading, signUp } = useAuth();
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!loading && user) return <Navigate to="/account" replace />;

  if (confirmEmail) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <MailCheck size={48} className="mx-auto text-brand-dark" />
        <h1 className="mt-4 text-2xl font-extrabold">Check your email</h1>
        <p className="mt-2 text-neutral-500">
          We sent you a confirmation link. Click it, then come back and sign in.
        </p>
        <Link to="/login" className="mt-6 inline-block font-semibold text-brand-dark hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      const { needsConfirmation } = await signUp(v.email, v.password, v.fullName.trim(), normalizePhone(v.phone));
      if (needsConfirmation) setConfirmEmail(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg.toLowerCase().includes("already") ? "An account with this email already exists." : "Could not create your account. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-neutral-500">Track your orders and check out faster.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className={input} autoComplete="name" />
        </Field>
        <Field label="Phone number" error={errors.phone?.message}>
          <input {...register("phone")} className={input} inputMode="tel" placeholder="0712 345 678" autoComplete="tel" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" className={input} autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input {...register("password")} type="password" className={input} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <input {...register("confirm")} type="password" className={input} autoComplete="new-password" />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-dark hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}