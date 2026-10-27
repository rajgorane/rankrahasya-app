import { createFileRoute } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/terms")({
  head: () => seo("Terms of use — RankRahasya", "Terms for using the RankRahasya astrology-inspired reflection report."),
  component: Terms,
});

function Terms() {
  return (
    <Page title="Terms of use" kicker="Last updated October 2026">
      <div className="prose-legal">
        <h2>The service</h2>
        <p>RankRahasya provides a ₹10 digital self-reflection report. It is astrology-inspired and for entertainment and self-discovery only.</p>
        <h2>No predictions or guarantees</h2>
        <p>The report is not scientifically proven and is not professional, academic, medical or psychological advice. It does not predict, influence or guarantee any exam rank, score, admission or result.</p>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Provide honest answers and keep your private report link safe.</li>
          <li>Do not misuse, copy or resell the service.</li>
        </ul>
        <h2>Payments</h2>
        <p>Payments are processed by Razorpay. A report is issued only after the payment is verified on our server.</p>
        <h2>Liability</h2>
        <p>To the extent allowed by law, our total liability is limited to the amount you paid for the report.</p>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India.</p>
      </div>
    </Page>
  );
}