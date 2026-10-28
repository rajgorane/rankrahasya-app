import { createFileRoute } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/refund")({
  head: () => seo("Refund policy — RankRahasya", "When and how RankRahasya refunds the ₹10 report payment."),
  component: Refund,
});

function Refund() {
  return (
    <Page title="Refund policy" kicker="Last updated October 2026">
      <div className="prose-legal">
        <h2>Full refund if</h2>
        <ul>
          <li>You were charged but your report was not delivered.</li>
          <li>You were charged more than once for the same report.</li>
        </ul>
        <p>Email support@rankrahasya.in with your Razorpay payment ID within 7 days. Approved refunds go back to the original payment method, usually within 5–7 working days.</p>
        <h2>Not refundable</h2>
        <p>Once a report has been delivered, it is a digital product and is generally not refundable because you disagree with its content — please review the blurred report preview on the home page before buying.</p>
        <h2>Failed or cancelled payments</h2>
        <p>If a payment fails, any amount debited by your bank is normally reversed automatically by Razorpay/your bank.</p>
      </div>
    </Page>
  );
}