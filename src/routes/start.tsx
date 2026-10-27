import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { Disclaimer, Page, seo } from "@/components/site";
import { answersSchema, PRICE_LABEL, type Answers } from "@/lib/report";
import { createReportOrder, getPaymentMode, verifyReportPayment } from "@/lib/orders.functions";

export const Route = createFileRoute("/start")({
  head: () => seo("Your reflection — RankRahasya", "Answer a few private study questions to explore your study patterns."),
  component: Start,
});

type Opt<K extends keyof Answers> = { key: K; label: string; options: { v: Answers[K]; l: string }[] };

const QUESTIONS = [
  { key: "exam", label: "Exam goal", options: [{ v: "JEE", l: "JEE" }, { v: "NEET", l: "NEET" }, { v: "Other", l: "Other" }] },
  { key: "studyHours", label: "Focused study hours on a typical day", options: [{ v: "lt3", l: "Under 3" }, { v: "3to6", l: "3–6" }, { v: "6to9", l: "6–9" }, { v: "9plus", l: "9+" }] },
  { key: "bestTime", label: "When do you feel sharpest?", options: [{ v: "morning", l: "Morning" }, { v: "afternoon", l: "Afternoon" }, { v: "evening", l: "Evening" }, { v: "night", l: "Late night" }] },
  { key: "focus", label: "How is your focus usually?", options: [{ v: "scattered", l: "Often scattered" }, { v: "variable", l: "Up and down" }, { v: "steady", l: "Mostly steady" }] },
  { key: "distraction", label: "Biggest distraction", options: [{ v: "phone", l: "Phone" }, { v: "people", l: "People / surroundings" }, { v: "overthinking", l: "Overthinking" }, { v: "fatigue", l: "Tiredness" }] },
  { key: "motivation", label: "What motivates you most?", options: [{ v: "family", l: "My family" }, { v: "dream", l: "A dream career" }, { v: "curiosity", l: "Curiosity" }, { v: "proving", l: "Proving myself" }] },
  { key: "challenge", label: "Your hardest part right now", options: [{ v: "revision", l: "Revision" }, { v: "consistency", l: "Staying consistent" }, { v: "doubts", l: "Clearing doubts" }, { v: "tests", l: "Mock tests" }] },
] as Opt<keyof Answers>[];

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Start() {
  const navigate = useNavigate();
  const create = useServerFn(createReportOrder);
  const verify = useServerFn(verifyReportPayment);
  const modeFn = useServerFn(getPaymentMode);
  const { data: mode } = useQuery({ queryKey: ["payment-mode"], queryFn: () => modeFn() });

  const [form, setForm] = useState<Partial<Record<keyof Answers, unknown>>>({ consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notice, setNotice] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const pending = useRef<{ token: string; orderId: string; keyId: string; amount: number } | null>(null);

  const set = (k: keyof Answers, v: unknown) => { setForm((f) => ({ ...f, [k]: v })); setShowPreview(false); };

  function openCheckout(o: NonNullable<typeof pending.current>) {
    if (!window.Razorpay) return;
    const rz = new window.Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: o.amount,
      currency: "INR",
      name: "RankRahasya",
      description: "Personal reflection report",
      theme: { color: "#0B1024" },
      handler: async (r: RazorpayResponse) => {
        setBusy(true);
        setNotice({ kind: "info", text: "Verifying your payment…" });
        try {
          const res = await verify({ data: { token: o.token, ...r } });
          if (!res.ok) setNotice({ kind: "info", text: `${res.reason} We'll keep checking on the report page.` });
        } catch {
          /* report page will keep checking via webhook */
        }
        navigate({ to: "/report/$token", params: { token: o.token } });
      },
      modal: {
        ondismiss: () => {
          setBusy(false);
          setNotice({ kind: "info", text: "Payment cancelled. No money was taken. You can try again." });
        },
      },
    });
    rz.on("payment.failed", () => {
      setBusy(false);
      setNotice({ kind: "error", text: "Payment failed. No report was generated. Please try again or use another method." });
    });
    rz.open();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const parsed = answersSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    if (!showPreview) { setShowPreview(true); return; }
    if (pending.current) return openCheckout(pending.current);
    setBusy(true);
    try {
      const res = await create({ data: parsed.data });
      if (res.mode === "demo") {
        navigate({ to: "/report/$token", params: { token: res.token } });
        return;
      }
      if (!(await loadCheckout())) throw new Error("Could not load the payment window. Check your connection.");
      pending.current = { token: res.token, orderId: res.orderId, keyId: res.keyId, amount: res.amount };
      openCheckout(pending.current);
    } catch (err) {
      setBusy(false);
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>;
  const inputCls = "mt-2 w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground outline-none focus:border-gold";

  return (
    <Page title="Your reflection" kicker="About 2 minutes">
      {mode && !mode.available && (\n        <div className="mb-6 rounded-xl border border-warning/50 bg-muted p-4 text-sm">\n          <strong className="text-warning">Preview available — unlock setup is unfinished.</strong>{" "}\n          <span className="text-muted-foreground">You can explore your preview, but saving orders and payments will be enabled after the secure backend key is configured.</span>\n        </div>\n      )}\n      {mode?.available && !mode.live && (
        <div className="mb-6 rounded-xl border border-warning/50 bg-muted p-4 text-sm">
          <strong className="text-warning">Demo mode — payments are not live.</strong>{" "}
          <span className="text-muted-foreground">No payment will be taken or claimed. You'll see a demo report marked as unpaid.</span>
        </div>
      )}
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div id="f-name">
          <label className="text-sm font-medium" htmlFor="name">First name or nickname</label>
          <input id="name" maxLength={30} autoComplete="off" className={inputCls} value={(form.name as string) ?? ""} onChange={(e) => set("name", e.target.value)} />
          {err("name")}
        </div>
        <div id="f-birthDate">
          <label className="text-sm font-medium" htmlFor="dob">Birth date</label>
          <input id="dob" type="date" className={inputCls} max={new Date().toISOString().slice(0, 10)} value={(form.birthDate as string) ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
          <p className="mt-1 text-xs text-muted-foreground">Used only for your sun-season theme. We don't need birth time or place.</p>
          {err("birthDate")}
        </div>
        {QUESTIONS.map((q) => (
          <fieldset key={q.key} id={`f-${q.key}`}>
            <legend className="text-sm font-medium">{q.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const active = form[q.key] === o.v;
                return (
                  <button
                    type="button"
                    key={String(o.v)}
                    aria-pressed={active}
                    onClick={() => set(q.key, o.v)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-gold bg-gold text-primary-foreground" : "border-border bg-muted text-foreground hover:border-gold"}`}
                  >
                    {o.l}
                  </button>
                );
              })}
            </div>
            {err(q.key)}
          </fieldset>
        ))}

        <div id="f-consent" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Privacy & consent</p>
          <p className="mt-2">
            We store your nickname, birth date and answers only to create and show your report and handle support. No
            email or phone is collected. Payments are processed by Razorpay. See our{" "}
            <a href="/privacy" className="text-gold underline">privacy policy</a>.
          </p>
          <label className="mt-3 flex items-start gap-3 text-foreground">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--gold)]" checked={form.consent === true} onChange={(e) => set("consent", e.target.checked)} />
            <span>I understand this is astrology-inspired reflection, not a prediction or guarantee of any exam rank or result, and I agree to the data use above.</span>
          </label>
          {err("consent")}
        </div>

        {showPreview && (
          <section className="space-y-4 rounded-2xl border border-gold/40 bg-card p-5 shadow-glow">
            <div className="text-center">
              <Sparkles className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-gold">Made from your answers</p>
              <h2 className="mt-2 text-2xl font-semibold">Your study pattern has a story.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Here are two clues from the habits you shared.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold">Your natural study window</p>
              <p className="mt-1 text-sm text-muted-foreground">{({ morning: "You feel sharpest in the morning", afternoon: "You feel sharpest in the afternoon", evening: "You feel sharpest in the evening", night: "You feel sharpest late at night" } as Record<string, string>)[String(form.bestTime)] ?? "Your preferred study window"} may be a useful place to protect focused time.</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="font-semibold">A pattern worth exploring</p>
              <p className="mt-1 text-sm text-muted-foreground">{({ phone: "Phone interruptions", people: "Your surroundings", overthinking: "Overthinking", fatigue: "Tiredness" } as Record<string, string>)[String(form.distraction)] ?? "Your main distraction"} may be the first thing to design around—not fight with willpower alone.</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-gold/30 p-4">
              <div aria-hidden="true" className="pointer-events-none select-none space-y-3 blur-[5px] opacity-60">
                <p className="font-semibold">Your personal strengths and study rhythm</p>
                <div className="h-3 w-full rounded bg-muted" /><div className="h-3 w-4/5 rounded bg-muted" /><div className="h-3 w-11/12 rounded bg-muted" />
                <p className="font-semibold">Three practical next steps</p>
                <div className="h-3 w-3/4 rounded bg-muted" /><div className="h-3 w-full rounded bg-muted" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 px-3 text-center">
                <LockKeyhole className="h-5 w-5 text-gold" />
                <p className="mt-1 font-semibold">Unlock to reveal your full report</p>
                <p className="mt-1 text-xs text-muted-foreground">Study rhythm · strengths · next steps</p>
              </div>
            </div>
            {mode?.testMode && <p className="rounded-lg border border-warning/40 bg-muted p-3 text-center text-xs font-medium text-warning">TEST MODE — no real money will be charged</p>}
          </section>
        )}

        {notice && (
          <p role="status" className={`rounded-xl border p-3 text-sm ${notice.kind === "error" ? "border-destructive text-destructive" : "border-border text-foreground"}`}>
            {notice.text}
          </p>
        )}

        <button type="submit" disabled={busy || (showPreview && mode?.available === false)} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient py-4 text-lg font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {!showPreview ? "See my personal preview" : mode?.available === false ? "Unlock temporarily unavailable" : mode?.live === false ? "Unlock demo report (no payment)" : `Unlock my report — ${PRICE_LABEL}`}
        </button>
        {showPreview && <p className="text-center text-xs text-muted-foreground">One-time unlock · Your answers stay in this form if you need to retry.</p>}
        <Disclaimer compact />
      </form>
    </Page>
  );
}