import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";
import { ReportView } from "@/components/report-view";
import { generateReport, SAMPLE_ANSWERS } from "@/lib/report";

export const Route = createFileRoute("/sample-report")({
  head: () => seo("Sample report — RankRahasya", "See exactly what a RankRahasya self-reflection report looks like before you buy."),
  component: Sample,
});

function Sample() {
  return (
    <Page title="Report preview" kicker="Sample for a fictional student">
      <p className="mb-6 text-muted-foreground">
        This is a sample built from made-up answers. Your report follows the same structure, written from your own answers.
      </p>
      <ReportView report={generateReport(SAMPLE_ANSWERS)} />
      <Link to="/start" className="mt-8 block rounded-full bg-gold-gradient py-4 text-center text-lg font-semibold text-primary-foreground">
        Get my own report · ₹10
      </Link>
    </Page>
  );
}