import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Clipboard, Download, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Page, seo } from "@/components/site";
import { ReportView } from "@/components/report-view";
import { getReportByToken, registerChallengeInterest } from "@/lib/orders.functions";

const reportQuery = (token: string) =>
  queryOptions({
    queryKey: ["report", token],
    queryFn: () => getReportByToken({ data: { token } }),
    refetchInterval: (q) => (q.state.data?.status === "created" ? 4000 : false),
  });

export const Route = createFileRoute("/report/$token")({
  head: () => seo("Your report — RankRahasya", "Your private RankRahasya reflection report.", { noindex: true }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(reportQuery(params.token)),
  errorComponent: () => (
    <Page title="Report not found"><p className="text-muted-foreground">This link looks invalid. Check you copied it fully.</p></Page>
  ),
  component: ReportPage,
});

function ReportPage() {
  const { token } = Route.useParams();
  const { data } = useSuspenseQuery(reportQuery(token));
  const [linkCopied, setLinkCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState("");
  const [challengeConsent, setChallengeConsent] = useState(false);
  const [challengeState, setChallengeState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [challengeMessage, setChallengeMessage] = useState("");

  async function copyPrivateLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setCopyError(false);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setCopyError(true);
      setLinkCopied(false);
    }
  }

  if (!data) {
    return <Page title="Report not found"><p className="text-muted-foreground">We couldn't find a report for this link.</p></Page>;
  }
  if (data.status === "created") {
    return (
      <Page title="Confirming your payment" kicker="Please wait">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
          <Loader2 className="mt-1 h-5 w-5 shrink-0 animate-spin text-gold" />
          <p>We haven't received confirmation from Razorpay yet. This page checks automatically. If you cancelled, no money was taken — you can <Link to="/start" className="text-gold underline">start again</Link>. If money was debited, contact us with your payment ID.</p>
        </div>
      </Page>
    );
  }
  if (data.status === "failed" || !data.report) {
    return (
      <Page title="Payment not completed">
        <p className="text-muted-foreground">Your payment failed, so no report was generated. <Link to="/start" className="text-gold underline">Try again</Link>.</p>
      </Page>
    );
  }
  return (
    <Page title="Your reflection report" kicker={data.mode === "demo" ? "Demo · unpaid" : "Paid · ₹10"}>
      {data.mode === "demo" && (
        <div className="mb-6 rounded-xl border border-warning/50 bg-muted p-4 text-sm print:hidden">
          <strong className="text-warning">Demo report — payments are not live.</strong>{" "}
          <span className="text-muted-foreground">No payment was taken for this report.</span>
        </div>
      )}
      <div id="printable-report"><ReportView report={data.report} /></div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-4 print:hidden">
        <h2 className="text-xl font-semibold">Keep your report</h2>
        <p className="mt-1 text-sm text-muted-foreground">Save a PDF for offline access, or copy your private link to return later.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-4 py-3 font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Save report as PDF
          </button>
          <button type="button" onClick={copyPrivateLink} className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 font-medium text-foreground hover:border-gold">
            {linkCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {linkCopied ? "Private link copied" : "Copy private report link"}
          </button>
        </div>
        {copyError && <p role="status" className="mt-3 text-sm text-destructive">Could not copy automatically. Use your browser's address bar to copy this private link.</p>}
        <p className="mt-3 text-xs text-muted-foreground">The PDF option opens your device's print dialog. Choose “Save as PDF” if available. Keep the private link and PDF somewhere secure.</p>
      </div>
      <a className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-5 py-3 font-medium text-foreground hover:bg-[#25D366]/10 print:hidden" href={"https://wa.me/?text=" + encodeURIComponent("I tried RankRahasya’s personal study-pattern reflection. Curious what yours might say? Check it out: " + window.location.href)} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5 text-[#25D366]" />Share report on WhatsApp</a>

      {data.mode === "live" && data.status === "paid" && (
        <section className="mt-8 rounded-2xl border border-gold/30 bg-card p-6 print:hidden" aria-labelledby="challenge-title">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Coming soon · Optional</p>
          <h2 id="challenge-title" className="mt-2 text-2xl font-semibold">The 7-Day Comeback</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Build a consistent study habit with seven days of small daily tasks, tests, and accountability.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted p-3"><strong className="block text-lg">7 days</strong><span className="text-xs text-muted-foreground">Daily tasks</span></div>
            <div className="rounded-xl bg-muted p-3"><strong className="block text-lg">₹100</strong><span className="text-xs text-muted-foreground">Proposed commitment</span></div>
            <div className="rounded-xl bg-muted p-3"><strong className="block text-lg">₹10/day</strong><span className="text-xs text-muted-foreground">Proposed return</span></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Concept only. No payment is being collected. The proposed model returns ₹10 for each completed day, with the remaining ₹30 settled on day seven if all ₹100 is refundable. Final rules will be published before launch.
          </p>
          {!challengeOpen && challengeState !== "success" && (
            <button type="button" onClick={() => setChallengeOpen(true)} className="mt-5 w-full rounded-full bg-gold-gradient px-5 py-3 font-semibold text-primary-foreground">
              I’m interested
            </button>
          )}
          {challengeOpen && challengeState !== "success" && (
            <form className="mt-5 space-y-4" onSubmit={async (event) => {
              event.preventDefault();
              setChallengeState("sending");
              setChallengeMessage("");
              try {
                await registerChallengeInterest({ data: { token, email: challengeEmail.trim(), consent: true } });
                setChallengeState("success");
                setChallengeMessage("Your interest has been saved. This email may be used for challenge launch updates.");
                setChallengeEmail("");
              } catch {
                setChallengeState("error");
                setChallengeMessage("We couldn’t save your interest. Please check your email and try again.");
              }
            }}>
              <div>
                <label htmlFor="challenge-email" className="mb-2 block text-sm font-medium">Email address</label>
                <input id="challenge-email" type="email" name="email" required maxLength={254} autoComplete="email"
                  value={challengeEmail} onChange={(event) => setChallengeEmail(event.target.value)}
                  placeholder="you@example.com" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" />
              </div>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" required checked={challengeConsent} onChange={(event) => setChallengeConsent(event.target.checked)} className="mt-1 accent-[var(--color-gold)]" />
                <span>I agree to be contacted by email about the The 7-Day Comeback.</span>
              </label>
              {challengeState === "error" && <p role="alert" className="text-sm text-destructive">{challengeMessage}</p>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={challengeState === "sending" || !challengeConsent} className="flex-1 rounded-full bg-gold-gradient px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
                  {challengeState === "sending" ? "Saving…" : "Notify me at launch"}
                </button>
                <button type="button" onClick={() => setChallengeOpen(false)} className="rounded-full border border-border px-5 py-3 text-sm font-medium">Cancel</button>
              </div>
              <p className="text-xs text-muted-foreground">No payment or commitment required to register interest.</p>
            </form>
          )}
          {challengeState === "success" && <p role="status" aria-live="polite" className="mt-5 rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-sm">{challengeMessage}</p>}

    </Page>
  );
}
