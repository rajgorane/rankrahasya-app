// Server-only helpers. Import dynamically inside handlers.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { answersSchema, generateReport, PRICE_PAISE, type Report } from "./report";

export function razorpayConfig() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export function newToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

async function maybeAiPolish(report: Report): Promise<{ report: Report; source: string }> {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) return { report, source: "template" };
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Rewrite the given self-reflection paragraphs for an Indian exam student in warm, simple English. Keep the same meaning. Never predict ranks, results or the future, never mention planets, houses or chart placements, never give medical advice. Return JSON {\"selfReflection\": string[]} with exactly the same number of paragraphs.",
          },
          { role: "user", content: JSON.stringify({ selfReflection: report.selfReflection }) },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { report, source: "template" };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { selfReflection?: unknown };
    const sr = parsed.selfReflection;
    if (Array.isArray(sr) && sr.length === report.selfReflection.length && sr.every((s) => typeof s === "string" && s.length < 800)) {
      return { report: { ...report, selfReflection: sr as string[] }, source: "template+ai" };
    }
  } catch {
    /* fall back to template */
  }
  return { report, source: "template" };
}

/**
 * Idempotent fulfilment: marks the order paid and generates the report once.
 * Safe to call from both the checkout verification and the webhook.
 */
export async function fulfilOrder(orderId: string, paymentId: string, amount: number) {
  if (amount !== PRICE_PAISE) throw new Error("Amount mismatch");
  const { data: row, error } = await supabaseAdmin
    .from("report_orders")
    .select("id, status, report, answers, amount_paise")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (error || !row) throw new Error("Order not found");
  if (row.amount_paise !== PRICE_PAISE) throw new Error("Amount mismatch");
  if (row.status === "paid" && row.report) return;

  await supabaseAdmin
    .from("report_orders")
    .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq("id", row.id)
    .neq("status", "paid");

  if (!row.report) {
    const answers = answersSchema.parse(row.answers);
    const { report, source } = await maybeAiPolish(generateReport(answers));
    // Only the first writer stores a report (guards against webhook + checkout racing).
    await supabaseAdmin
      .from("report_orders")
      .update({ report: report as never, report_source: source })
      .eq("id", row.id)
      .is("report", null);
  }
}