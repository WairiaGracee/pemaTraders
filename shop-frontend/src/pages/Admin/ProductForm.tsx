import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ImagePlus, Loader2 } from "lucide-react";
import { adminGetProduct, createProduct, updateProduct, uploadProductImage } from "@/lib/admin";
import { useCategories } from "@/hooks/useCatalog";
import type { Category, Product } from "@/types/product";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter a product name"),
    category: z.string().min(1, "Choose a category"),
    description: z.string(),
    price: z.string().regex(/^\d+$/, "Enter the price in KES (whole number)"),
    compareAt: z.string().regex(/^\d*$/, "Numbers only"),
    stock: z.string().regex(/^\d+$/, "Enter how many are in stock"),
    active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (/^\d+$/.test(v.price) && Number(v.price) < 1) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Price must be more than 0" });
    }
    if (v.compareAt && Number(v.compareAt) <= Number(v.price)) {
      ctx.addIssue({ code: "custom", path: ["compareAt"], message: "Must be higher than the price" });
    }
  });
type FormValues = z.infer<typeof schema>;

const input =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand";

function Field({ label, hint, error, children }: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Editor({ product, categories }: { product?: Product; categories: Category[] }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const existingImage = product?.image ?? "";

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : existingImage), [file, existingImage]);
  useEffect(
    () => () => {
      if (file) URL.revokeObjectURL(preview);
    },
    [file, preview]
  );

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      compareAt: product?.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: product ? String(product.stock) : "1",
      active: product?.active ?? true,
    },
  });

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image file (JPG or PNG).");
    if (f.size > 15 * 1024 * 1024) return setError("That photo is too large. Choose one under 15 MB.");
    setError("");
    setFile(f);
  };

  const onSubmit = async (v: FormValues) => {
    setError("");
    try {
      let image = existingImage;
      if (file) image = await uploadProductImage(file);
      if (!image) {
        setError("Please add a product photo.");
        return;
      }

      const data = {
        name: v.name.trim(),
        description: v.description.trim(),
        category: v.category,
        price: Number(v.price),
        compareAtPrice: v.compareAt ? Number(v.compareAt) : null,
        stock: Number(v.stock),
        image,
        active: v.active,
      };

      if (product) await updateProduct(product.id, data);
      else await createProduct(data);

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-products"] }),
        qc.invalidateQueries({ queryKey: ["admin-product"] }),
        qc.invalidateQueries({ queryKey: ["products"] }),
      ]);
      navigate("/admin/products");
    } catch {
      setError("Could not save the product. If you chose a photo, try a JPG or PNG, then try again.");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline">
        <ChevronLeft size={16} /> Back to products
      </Link>
      <h1 className="text-2xl font-extrabold">{product ? "Edit product" : "Add product"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
        {/* Photo */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid h-36 w-36 place-items-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={32} className="text-neutral-300" />
            )}
          </div>
          <div>
            <label className="inline-block cursor-pointer rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:border-brand hover:text-brand-dark">
              {preview ? "Change photo" : "Choose photo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            </label>
            <p className="mt-2 text-xs text-neutral-500">
              A clear, well-lit photo on a plain background works best. Large photos are resized automatically.
            </p>
          </div>
        </div>

        <Field label="Product name" error={errors.name?.message}>
          <input {...register("name")} className={input} placeholder="e.g. 3 Seater Fabric Sofa" />
        </Field>

        <Field label="Category" error={errors.category?.message}>
          <select {...register("category")} className={input}>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description" hint="Size, material, colour, warranty, anything a buyer would ask.">
          <textarea {...register("description")} rows={4} className={input} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (KES)" error={errors.price?.message}>
            <input {...register("price")} inputMode="numeric" className={input} placeholder="15000" />
          </Field>
          <Field label="Old price (optional)" hint="Shows a discount badge" error={errors.compareAt?.message}>
            <input {...register("compareAt")} inputMode="numeric" className={input} placeholder="18000" />
          </Field>
          <Field label="In stock" error={errors.stock?.message}>
            <input {...register("stock")} inputMode="numeric" className={input} />
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" {...register("active")} className="h-4 w-4 accent-[#d99a00]" />
          Show this product in the shop
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-brand px-7 py-3 font-semibold text-ink transition hover:bg-brand-dark hover:text-white disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {product ? "Save changes" : "Add product"}
          </button>
          <Link
            to="/admin/products"
            className="rounded-full border border-neutral-300 px-7 py-3 font-semibold hover:bg-neutral-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const { categories, isLoading: loadingCategories } = useCategories();
  const { data: product, isLoading: loadingProduct, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminGetProduct(id!),
    enabled: !!id,
  });

  if (loadingCategories || (id && loadingProduct)) return <p className="text-neutral-500">Loading...</p>;
  if (id && (error || !product)) return <p className="text-red-600">Product not found.</p>;

  // key forces a fresh form when switching between products
  return <Editor key={id ?? "new"} product={product} categories={categories} />;
}