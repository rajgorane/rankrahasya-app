import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { Disclaimer, Emblem, seo } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "RankRahasya — personal study reflection for JEE & NEET students",
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
              Build my personal report
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No login · No phone number · About 2 minutes</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5">
        <Disclaimer />
      </section>

      <section className="mx-auto mt-12 max-w-3xl px-5">
        <div className="rounded-3xl border border-gold/30 bg-card p-5 sm:p-8">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-gold">A glimpse of your report</p>
          <h2 className="mt-3 text-center text-2xl font-semibold sm:text-3xl">Not just a horoscope. A study plan built from your answers.</h2>
          <div className="mt-6 rounded-2xl border border-border bg-background p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Example insight · fictional student</p>
            <p className="mt-2 text-lg font-medium">“You report long study days, but your focus can scatter.”</p>
            <p className="mt-2 text-muted-foreground">Your report connects answers like study hours, focus, distractions and your biggest challenge to practical actions you can try.</p>
            <div className="relative mt-5 overflow-hidden rounded-xl">
              <div aria-hidden="true" className="pointer-events-none select-none space-y-3 blur-[3px]">
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Your answer combination</p>
                  <p className="mt-2 text-sm text-muted-foreground">A tailored observation connecting your routine, focus and biggest obstacle.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Your personal game plan</p>
                  <p className="mt-2 text-sm text-muted-foreground">A practical routine built around your strongest time of day and the friction you selected.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="font-semibold">Three next steps</p>
                  <p className="mt-2 text-sm text-muted-foreground">Actions tailored to your exam goal and your stated challenge.</p>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 p-4 text-center backdrop-blur-[1px]">
                <p className="font-semibold">Your full report is personal to your answers</p>
                <p className="mt-1 text-sm text-muted-foreground">Answer a few questions to build yours.</p>
                <Link to="/start" className="mt-4 rounded-full bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground">Create my report</Link>
              </div>
            </div>
          </div>
        </div>
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