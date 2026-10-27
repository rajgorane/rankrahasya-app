import { createFileRoute } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact — RankRahasya", "Get help with your RankRahasya report or payment."),
  component: Contact,
});

function Contact() {
  return (
    <Page title="Contact us" kicker="We're here to help">
      <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
        <p>For payment issues, refunds or questions about your report, write to:</p>
        <p className="mt-3 font-serif text-2xl text-gold">support@rankrahasya.in</p>
        <p className="mt-4 text-sm">
          Please include your Razorpay payment ID (from your UPI/bank SMS or Razorpay receipt) — never share card numbers,
          OTPs or UPI PINs. We usually reply within 2 working days.
        </p>
        <p className="mt-4 text-sm">If you are feeling overwhelmed by exam stress, please talk to someone you trust or call the Tele-MANAS helpline: 14416.</p>
      </div>
    </Page>
  );
}