import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Clipboard, Download, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Page, seo } from "@/components/site";
import { ReportView } from "@/components/report-view";
import { getReportByToken } from "@/lib/orders.functions";

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
      <div className="mb-5 rounded-2xl border border-border bg-card p-4 print:hidden">
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
      <a className="mb-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-5 py-3 font-medium text-foreground hover:bg-[#25D366]/10 print:hidden" href={"https://wa.me/?text=" + encodeURIComponent("I tried RankRahasya’s personal study-pattern reflection. Curious what yours might say? Check it out: https://rankrahasya-next.vercel.app")} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5 text-[#25D366]" />Share RankRahasya on WhatsApp</a>
      <div id="printable-report"><ReportView report={data.report} /></div>
    </Page>
  );
}
