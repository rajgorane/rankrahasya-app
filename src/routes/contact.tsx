import { createFileRoute } from "@tanstack/react-router";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact — RankRahasya", "Contact RankRahasya about refunds, payment issues or report questions."),
  component: Contact,
});

function Contact() {
  return (
    <Page title="Contact us" kicker="Refunds, issues or questions">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Use this form for refund requests, payment or report problems, or any other question. Include the details needed
          to investigate your request; we aim to reply within 2 working days.
        </p>
        <form action="https://formspree.io/f/mnppvavw" method="POST" className="space-y-5">
          <input type="hidden" name="_subject" value="RankRahasya support request" />
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Your name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Enter your name" />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="contact-type" className="mb-2 block text-sm font-medium">What do you need help with?</label>
            <select id="contact-type" name="request_type" required defaultValue=""
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground">
              <option value="" disabled>Select a topic</option>
              <option value="Refund request">Refund request</option>
              <option value="Payment issue">Payment issue</option>
              <option value="Report issue">Report issue</option>
              <option value="General question">General question</option>
              <option value="Privacy or data request">Privacy or data request</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact-payment" className="mb-2 block text-sm font-medium">Razorpay payment ID or order ID <span className="font-normal text-muted-foreground">(if relevant)</span></label>
            <input id="contact-payment" name="payment_or_order_id" type="text" maxLength={120}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Found on your payment receipt or SMS" />
            <p className="mt-2 text-xs text-muted-foreground">For refund or payment requests, include the payment ID if available. Never enter card details, OTPs, passwords or your UPI PIN.</p>
          </div>
          <div>
            <label htmlFor="contact-details" className="mb-2 block text-sm font-medium">Tell us what happened</label>
            <textarea id="contact-details" name="message" required minLength={10} maxLength={5000} rows={6}
              className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground"
              placeholder="For refunds: explain why you are requesting one. For a payment/report issue: describe the problem and when it happened. For other questions: include the details we need to help." />
          </div>
          <button type="submit" className="w-full rounded-full bg-gold-gradient px-5 py-3 font-semibold text-primary-foreground">
            Send support request
          </button>
        </form>
        <p className="mt-5 text-xs text-muted-foreground">Please send only information relevant to your request. If you are feeling overwhelmed by exam stress, talk to someone you trust or call the Tele-MANAS helpline at 14416.</p>
      </div>
    </Page>
  );
}