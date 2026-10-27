import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { Disclaimer, Emblem, seo } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "RankRahasya — ₹10 self-discovery report for JEE & NEET students",
      "An astrology-inspired reflection report built from your study habits. Practical next steps for Kota and pan-India aspirants. No rank predictions.",
    ),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="starfield">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:pt-24">
          <Emblem className="mx-auto h-16 w-16 text-gold" />
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold">For JEE · NEET · every aspirant</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-7xl">
            Know how <em className="text-gold">you</em> study best.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            A short, private questionnaire and an astrology-inspired lens — turned into a calm, personal report with
            three practical next steps.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/start" className="w-full rounded-full bg-gold-gradient px-8 py-4 text-lg font-semibold text-primary-foreground shadow-glow sm:w-auto">
              Get my report · ₹10
            </Link>
            <Link to="/sample-report" className="w-full rounded-full border border-border px-8 py-4 text-foreground hover:border-gold sm:w-auto">
              See a sample
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No login · No phone number · About 2 minutes</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5">
        <Disclaimer />
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-5">
        <h2 className="text-center text-3xl font-semibold sm:text-4xl">What you get</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Sparkles, t: "Self-reflection", d: "A gentle, astrology-inspired lens based on your birth season — clearly labelled as reflection, not fact." },
            { icon: Compass, t: "Potential strengths", d: "What already drives you, drawn from your own answers about motivation and focus." },
            { icon: NotebookPen, t: "Study-pattern observations", d: "Grounded in your hours, peak time, focus and distractions — practical, not mystical." },
            { icon: ShieldCheck, t: "3 practical next steps", d: "Concrete actions you can try this week, tailored to your exam and biggest challenge." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-3 text-2xl font-semibold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-3xl px-5 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">Private by design</h2>
        <p className="mt-4 text-muted-foreground">
          We ask only for a first name or nickname, your birth date, and a few study questions. No email, no phone, no
          birth time or place. Your report is opened with a private link only you hold.
        </p>
        <div className="mt-8 flex justify-center gap-4 text-sm">
          <Link to="/how-it-works" className="text-gold underline-offset-4 hover:underline">How it works</Link>
          <Link to="/privacy" className="text-gold underline-offset-4 hover:underline">Privacy policy</Link>
        </div>
      </section>
    </main>
  );
}