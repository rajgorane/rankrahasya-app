import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
        <div className="mb-6 rounded-xl border border-warning/50 bg-muted p-4 text-sm">
          <strong className="text-warning">Demo report — payments are not live.</strong>{" "}
          <span className="text-muted-foreground">No payment was taken for this report.</span>
        </div>
      )}
      <p className="mb-6 text-sm text-muted-foreground">Bookmark this page — this private link is the only way back to your report.</p>
      <ReportView report={data.report} />
    </Page>
  );
}