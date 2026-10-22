import { supabase } from "./supabase";

export async function startMpesaPayment(orderId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("pay-start", { body: { orderId } });

  if (error) {
    let message = "Could not send the M-Pesa prompt. Please try again.";
    const res = (error as { context?: Response }).context;
    if (res && typeof res.json === "function") {
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        /* keep the default message */
      }
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
}

export interface PaymentState {
  status: "pending" | "success" | "failed";
  message?: string;
  receipt?: string;
}

export async function getPaymentStatus(orderId: string): Promise<PaymentState | null> {
  const { data, error } = await supabase.rpc("get_payment_status", { p_order_id: orderId });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  const r = data[0] as { status: PaymentState["status"]; result_desc: string | null; receipt: string | null };
  return { status: r.status, message: r.result_desc ?? undefined, receipt: r.receipt ?? undefined };
}