import type { Report } from "@/lib/report";
import { Disclaimer } from "./site";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">{n}</p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

export function ReportView({ report }: { report: Report }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gold/30 bg-card p-6 text-center shadow-glow starfield">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Reflection for {report.exam} preparation</p>
        <h2 className="mt-2 text-4xl font-semibold">{report.name}</h2>
        <p className="mt-2 text-muted-foreground">
          Sun-season theme: <span className="text-gold">{report.theme.sign}</span> · {report.theme.element} ·{" "}
          “{report.theme.keyword}”
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Based on your birth date only. This is not a Vedic or natal chart — no planetary placements were calculated.
        </p>
      </div>
      <Section n="I · astrology-inspired" title="Self-reflection">
        {report.selfReflection.map((p, i) => <p key={i}>{p}</p>)}
      </Section>
      <Section n="II" title="Potential strengths">
        <ul className="space-y-2">
          {report.strengths.map((s, i) => (
            <li key={i} className="flex gap-3"><span className="text-gold">✦</span><span>{s}</span></li>
          ))}
        </ul>
      </Section>
      <Section n="III · from your answers" title="Study-pattern observations">
        <ul className="space-y-2">
          {report.studyPatterns.map((s, i) => (
            <li key={i} className="flex gap-3"><span className="text-gold">✦</span><span>{s}</span></li>
          ))}
        </ul>
      </Section>
      <Section n="IV · your answer combination" title="What stands out for you">
        <ul className="space-y-3">
          {report.personalSnapshot.map((s, i) => (
            <li key={i} className="flex gap-3"><span className="text-gold">✦</span><span>{s}</span></li>
          ))}
        </ul>
      </Section>
      <Section n="V · tailored to your routine" title="Your personal game plan">
        <ol className="space-y-4">
          {report.personalPlan.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-serif text-3xl leading-none text-gold">{i + 1}</span>
              <div><p className="font-semibold text-foreground">{s.title}</p><p className="mt-1">{s.detail}</p></div>
            </li>
          ))}
        </ol>
      </Section>
      <Section n="VI" title="3 practical next steps">
        <ol className="space-y-4">
          {report.nextSteps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-serif text-3xl leading-none text-gold">{i + 1}</span>
              <div><p className="font-semibold text-foreground">{s.title}</p><p className="mt-1">{s.detail}</p></div>
            </li>
          ))}
        </ol>
      </Section>
      <Disclaimer />
    </div>
  );
}