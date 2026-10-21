import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/store/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/account";
  const [error, setError] = useState("");

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!loading && user) return <Navigate to={from} replace />;

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      await signIn(v.email, v.password);
    } catch {
      setError("Incorrect email or password.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-neutral-500">Sign in to see your orders and details.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input {...register("email")} type="email" autoComplete="email" className={input} />
          {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <input {...register("password")} type="password" autoComplete="current-password" className={input} />
          {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        New here?{" "}
        <Link to="/register" className="font-semibold text-brand-dark hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}