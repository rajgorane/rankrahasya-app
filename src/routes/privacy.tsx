import { createFileRoute } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy policy — RankRahasya", "What RankRahasya collects, why, and how long we keep it."),
  component: Privacy,
});

function Privacy() {
  return (
    <Page title="Privacy policy" kicker="Last updated October 2026">
      <div className="prose-legal">
        <h2>What we collect</h2>
        <ul>
          <li>A first name or nickname you choose.</li>
          <li>Your birth date (to find your sun-season theme).</li>
          <li>Your exam goal and answers to study-routine questions.</li>
          <li>Payment status and Razorpay order/payment IDs. Card, UPI and bank details are handled only by Razorpay.</li>
        </ul>
        <p>We do not ask for email, phone number, birth time, birth place, address or login.</p>
        <h2>Why we use it</h2>
        <p>Only to generate and show your report, confirm your payment, prevent duplicate charges and answer support requests. We do not sell your data or use it for advertising.</p>
        <h2>Optional AI wording</h2>
        <p>If enabled by us, the self-reflection paragraphs (not your name-linked payment data) may be sent to an AI provider to improve wording. Your report is always generated from fixed rules first.</p>
        <h2>Access and retention</h2>
        <p>Your report is reachable through a private link. We keep records for up to 12 months for support and accounting, then delete them. Email us to request deletion sooner.</p>
        <h2>Students under 18</h2>
        <p>If you are under 18, please use RankRahasya with a parent or guardian's knowledge.</p>
        <h2>Contact</h2>
        <p>support@rankrahasya.in</p>
      </div>
    </Page>
  );
}