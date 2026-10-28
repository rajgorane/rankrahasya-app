import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const [notice, setNotice] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const pending = useRef<{ token: string; orderId: string; keyId: string; amount: number } | null>(null);

  const set = (k: keyof Answers, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

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

  const isComplete = answersSchema.safeParse(form).success;
  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>;
  const today = new Date();
  const dateAtAge = (years: number) => {
    const date = new Date(today);
    date.setFullYear(date.getFullYear() - years);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  };
  const minBirthDate = dateAtAge(70);
  const maxBirthDate = dateAtAge(16);
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const earliestYear = Number(minBirthDate.slice(0, 4));
  const latestYear = Number(maxBirthDate.slice(0, 4));
  // Put the most common student birth years first, while retaining the full supported range.
  const birthYears = Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => latestYear - i);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = birthYear && birthMonth ? new Date(Number(birthYear), Number(birthMonth), 0).getDate() : 31;
  const inputCls = "mt-2 w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground outline-none focus:border-gold";

  return (
    <Page title="Your reflection" kicker="About 2 minutes">
      {mode && !mode.available && (
        <div className="mb-6 rounded-xl border border-warning/50 bg-muted p-4 text-sm">
          <strong className="text-warning">Unlock is temporarily unavailable.</strong>{" "}
          <span className="text-muted-foreground">Secure order creation and payments will be enabled after backend setup is completed.</span>
        </div>
      )}
      {mode?.available && !mode.live && (
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
          <label className="text-sm font-medium" htmlFor="birth-year">Birth date</label>
          <div className="grid grid-cols-3 gap-2">
            <select id="birth-year" aria-label="Birth year" aria-invalid={!!errors.birthDate} className={inputCls} value={birthYear}
              onChange={(e) => {
                const year = e.target.value;
                setBirthYear(year);
                const day = birthDay ? Math.min(Number(birthDay), year && birthMonth ? new Date(Number(year), Number(birthMonth), 0).getDate() : 31) : 0;
                setBirthDay(day ? String(day) : "");
                set("birthDate", year && birthMonth && day ? `${year}-${birthMonth.padStart(2, "0")}-${String(day).padStart(2, "0")}` : "");
              }}>
              <option value="">Year</option>
              {birthYears.map((year) => <option key={year} value={String(year)}>{year}</option>)}
            </select>
            <select aria-label="Birth month" className={inputCls} value={birthMonth}
              onChange={(e) => {
                const month = e.target.value;
                setBirthMonth(month);
                const day = birthDay ? Math.min(Number(birthDay), birthYear && month ? new Date(Number(birthYear), Number(month), 0).getDate() : 31) : 0;
                setBirthDay(day ? String(day) : "");
                set("birthDate", birthYear && month && day ? `${birthYear}-${month.padStart(2, "0")}-${String(day).padStart(2, "0")}` : "");
              }}>
              <option value="">Month</option>
              {monthNames.map((month, i) => <option key={month} value={String(i + 1)}>{month}</option>)}
            </select>
            <select aria-label="Birth day" className={inputCls} value={birthDay}
              onChange={(e) => {
                const day = e.target.value;
                setBirthDay(day);
                set("birthDate", birthYear && birthMonth && day ? `${birthYear}-${birthMonth.padStart(2, "0")}-${day.padStart(2, "0")}` : "");
              }}>
              <option value="">Day</option>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => <option key={day} value={String(day)}>{day}</option>)}
            </select>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Choose year, month and day. Birth time and place are not needed.</p>
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

        {notice && (
          <p role="status" className={`rounded-xl border p-3 text-sm ${notice.kind === "error" ? "border-destructive text-destructive" : "border-border text-foreground"}`}>
            {notice.text}
          </p>
        )}

        <button type="submit" disabled={busy || mode?.available === false} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient py-4 text-lg font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {mode?.available === false ? "Unlock temporarily unavailable" : mode?.live === false ? "Unlock demo report (no payment)" : isComplete ? `Unlock my report — ${PRICE_LABEL}` : "Complete your answers to unlock"}
        </button>
        <Disclaimer compact />
      </form>
    </Page>
  );
}