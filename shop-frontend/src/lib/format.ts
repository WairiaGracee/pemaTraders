const kes = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});
export const formatKES = (n: number) => kes.format(n);

// 0712345678 / +254712345678 / 712345678  ->  254712345678
export const normalizePhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  return "254" + d;
};