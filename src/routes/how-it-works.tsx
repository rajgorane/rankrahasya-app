import { createFileRoute, Link } from "@tanstack/react-router";
import { Disclaimer, Page, seo } from "@/components/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => seo("How it works — RankRahasya", "Answer a few study questions, pay ₹10 securely, and read your personal reflection report instantly."),
  component: HowItWorks,
});

const STEPS = [
  { t: "Answer 7 short questions", d: "First name or nickname, birth date, exam goal, and how you actually study — hours, peak time, focus, distractions, motivation." },
  { t: "Pay ₹10 securely", d: "Checkout is handled by Razorpay (UPI, cards, netbanking). We never see your card or UPI details. Payment is verified on our server." },
  { t: "Read your report", d: "Your report is generated once and opened through a private link. Bookmark it — there is no login." },
];

function HowItWorks() {
  return (
    <Page title="How it works" kicker="Three steps">
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex gap-5 rounded-2xl border border-border bg-card p-6">
            <span className="font-serif text-4xl leading-none text-gold">{i + 1}</span>
            <div><h2 className="text-2xl font-semibold">{s.t}</h2><p className="mt-2 text-muted-foreground">{s.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
        <h2 className="text-2xl font-semibold text-foreground">What the “astrology” part is</h2>
        <p className="mt-2">
          We use only your birth date to find your tropical sun-season (e.g. “Virgo season”) and use its traditional
          theme as a prompt for reflection. We do not calculate a Vedic or natal chart, planetary placements or houses.
          Everything about your study habits comes directly from your own answers.
        </p>
      </div>
      <div className="mt-6"><Disclaimer /></div>
      <Link to="/start" className="mt-8 block rounded-full bg-gold-gradient py-4 text-center text-lg font-semibold text-primary-foreground">
        Start · ₹10
      </Link>
    </Page>
  );
}