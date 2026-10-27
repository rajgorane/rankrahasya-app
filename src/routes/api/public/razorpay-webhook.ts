import { createFileRoute } from "@tanstack/react-router";

type WebhookBody = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string } } };
};

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const raw = await request.text();
        if (raw.length > 100_000) return new Response("Too large", { status: 413 });

        const { verifyWebhookSignature } = await import("@/lib/razorpay-signature");
        if (!/^[a-f0-9]{64}$/.test(signature) || !(await verifyWebhookSignature(raw, signature, secret))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let body: WebhookBody;
        try {
          body = JSON.parse(raw) as WebhookBody;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const p = body.payload?.payment?.entity;
        if (!p?.order_id || !p.id) return Response.json({ ignored: true });

        if (body.event === "payment.captured" || body.event === "order.paid") {
          if (p.currency !== "INR") return Response.json({ ignored: true });
          const { fulfilOrder } = await import("@/lib/orders.server");
          try {
            await fulfilOrder(p.order_id, p.id, p.amount ?? 0);
          } catch {
            return Response.json({ ignored: true });
          }
          return Response.json({ ok: true });
        }

        if (body.event === "payment.failed") {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("report_orders")
            .update({ status: "failed" })
            .eq("razorpay_order_id", p.order_id)
            .eq("status", "created");
          return Response.json({ ok: true });
        }
        return Response.json({ ignored: true });
      },
    },
  },
});