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
      {report.discoveryProfile && (
        <section className="overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-glow print:break-inside-avoid" aria-labelledby="discovery-title">
          <div className="starfield bg-[#10162B] p-6 text-center text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Your RankRahasya profile</p>
            <h2 id="discovery-title" className="mt-3 text-3xl font-semibold sm:text-4xl">{report.discoveryProfile.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-200">{report.discoveryProfile.tagline}</p>
            <p className="mt-3 text-xs text-slate-400">A reflection based on your answers—not a fixed personality label.</p>
          </div>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {report.discoveryProfile.tags.map((tag) => (
                <div key={tag.label} className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="font-semibold text-foreground">{tag.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{tag.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gold/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Your unexpected angle</p>
              <h3 className="mt-2 text-xl font-semibold">{report.discoveryProfile.insight.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.discoveryProfile.insight.observation}</p>
              <p className="mt-3 text-sm leading-6"><span className="font-semibold text-foreground">Another possibility: </span><span className="text-muted-foreground">{report.discoveryProfile.insight.alternative}</span></p>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="font-semibold text-foreground">Test it in real life</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{report.discoveryProfile.insight.experiment}</p>
              </div>
            </div>
          </div>
        </section>
      )}
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