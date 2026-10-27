import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/faq")({
  head: () => seo("FAQ — RankRahasya", "Answers about the ₹10 report, astrology-inspired reflection, privacy, payments and refunds."),
  component: Faq,
});

const QA = [
  ["Will this predict my JEE/NEET rank or result?", "No. RankRahasya does not predict or guarantee any rank, score or result. It is astrology-inspired self-reflection plus practical study suggestions based on your answers."],
  ["Is astrology scientifically proven?", "No. We present the astrological part only as a reflective lens for fun and self-discovery. The study observations come from your own questionnaire answers."],
  ["Do you make a Vedic or birth chart?", "Not in this version. We use only your birth date to find your sun-season theme. We don't calculate planets, houses or placements, so we don't need your birth time or place."],
  ["What data do you collect?", "A first name or nickname, birth date, exam goal and your study answers. No email, phone or login. Payment details are handled by Razorpay, not us."],
  ["How do I get my report again?", "After payment you land on a private link. Bookmark or save it — anyone with the link can view the report, so don't share it publicly."],
  ["What if my payment fails or I cancel?", "No report is generated and no money is taken by us. If money was debited but the report doesn't appear, contact us with your payment ID."],
  ["Is it really ₹10?", "Yes — one report, ₹10, one-time. No subscription."],
] as const;

function Faq() {
  return (
    <Page title="Questions" kicker="FAQ">
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
        {QA.map(([q, a]) => (
          <AccordionItem key={q} value={q}>
            <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Page>
  );
}