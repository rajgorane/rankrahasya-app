import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { answersSchema, generateReport, PRICE_PAISE, type Report } from "./report";

export const getPaymentMode = createServerFn({ method: "GET" }).handler(async () => {
  // Keep this readiness check independent of the admin client so missing secrets
  // can be reported to the UI instead of crashing the server function on import.
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  const available = !!process.env["SUPABASE_SERVICE_ROLE_KEY"];
  return { live: !!keyId && !!keySecret && available, testMode: !!keyId?.startsWith("rzp_test_"), available };
});

export const createReportOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => answersSchema.parse(input))
  .handler(async ({ data }) => {
    const { razorpayConfig, newToken } = await import("./orders.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cfg = razorpayConfig();
    const token = newToken();

    if (!cfg) {
      // Demo mode: no payment is taken and none is claimed.
      const { error } = await supabaseAdmin.from("report_orders").insert({
        access_token: token,
        mode: "demo",
        status: "demo",
        amount_paise: PRICE_PAISE,
        answers: data as never,
        report: generateReport(data) as never,
        report_source: "template",
      });
      if (error) throw new Error("Could not save your answers. Please try again.");
      return { mode: "demo" as const, token };
    }

    const auth = btoa(`${cfg.keyId}:${cfg.keySecret}`);
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: PRICE_PAISE,
        currency: "INR",
        receipt: `rr_${token.slice(0, 20)}`,
        notes: { product: "RankRahasya report" },
      }),
    });
    if (!res.ok) throw new Error("Payment service unavailable. Please try again shortly.");
    const order = (await res.json()) as { id: string; amount: number };
    if (order.amount !== PRICE_PAISE) throw new Error("Unexpected order amount");

    const { error } = await supabaseAdmin.from("report_orders").insert({
      access_token: token,
      mode: "live",
      status: "created",
      amount_paise: PRICE_PAISE,
      razorpay_order_id: order.id,
      answers: data as never,
    });
    if (error) throw new Error("Could not save your order. Please try again.");
    return { mode: "live" as const, token, orderId: order.id, keyId: cfg.keyId, amount: PRICE_PAISE };
  });

export const verifyReportPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().regex(/^[a-f0-9]{48}$/),
        razorpay_order_id: z.string().min(5).max(64),
        razorpay_payment_id: z.string().min(5).max(64),
        razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { razorpayConfig, fulfilOrder } = await import("./orders.server");
    const { verifyCheckoutSignature } = await import("./razorpay-signature");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cfg = razorpayConfig();
    if (!cfg) return { ok: false as const, reason: "Payments are not configured." };

    const { data: row } = await supabaseAdmin
      .from("report_orders")
      .select("razorpay_order_id")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!row || row.razorpay_order_id !== data.razorpay_order_id) return { ok: false as const, reason: "Order mismatch." };

    const valid = await verifyCheckoutSignature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature, cfg.keySecret);
    if (!valid) return { ok: false as const, reason: "Payment signature could not be verified." };

    // Double-check with Razorpay that the payment really exists for this order and amount.
    const pay = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(data.razorpay_payment_id)}`, {
      headers: { Authorization: `Basic ${btoa(`${cfg.keyId}:${cfg.keySecret}`)}` },
    });
    if (!pay.ok) return { ok: false as const, reason: "Could not confirm payment yet." };
    const p = (await pay.json()) as { order_id: string; amount: number; status: string; currency: string };
    if (p.order_id !== data.razorpay_order_id || p.amount !== PRICE_PAISE || p.currency !== "INR" || !["authorized", "captured"].includes(p.status)) {
      return { ok: false as const, reason: "Payment not confirmed." };
    }
    await fulfilOrder(data.razorpay_order_id, data.razorpay_payment_id, p.amount);
    return { ok: true as const };
  });

export type ReportView = {
  status: "created" | "paid" | "failed" | "demo";
  mode: "live" | "demo";
  report: Report | null;
};

export const getReportByToken = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) }).parse(input))
  .handler(async ({ data }): Promise<ReportView | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("report_orders")
      .select("status, mode, report")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!row) return null;
    const showReport = row.status === "paid" || row.status === "demo";
    return {
      status: row.status as ReportView["status"],
      mode: row.mode as ReportView["mode"],
      report: showReport ? (row.report as unknown as Report | null) : null,
    };
  });

export const registerChallengeInterest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      token: z.string().regex(/^[a-f0-9]{48}$/),
      email: z.string().trim().email().max(254),
      consent: z.literal(true),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error: orderError } = await supabaseAdmin
      .from("report_orders")
      .select("id")
      .eq("access_token", data.token)
      .eq("mode", "live")
      .eq("status", "paid")
      .maybeSingle();

    if (orderError || !order) {
      throw new Error("Interest can only be registered from a paid report.");
    }

    const { error } = await supabaseAdmin
      .from("challenge_interest")
      .upsert(
        { report_order_id: order.id, email: data.email, consented_at: new Date().toISOString() },
        { onConflict: "report_order_id" },
      );
    if (error) throw new Error("We couldn't save your interest. Please try again.");
    return { ok: true as const };
  });
