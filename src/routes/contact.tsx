import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact — RankRahasya", "Contact RankRahasya about refunds, payment issues or report questions."),
  component: Contact,
});

function Contact() {
  const [requestType, setRequestType] = useState("");
  return (
    <Page title="Contact us" kicker="Refunds, issues or questions">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Use this form for refund requests, payment or report problems, or any other question. Include the details needed
          to investigate your request; we aim to reply within 2 working days.
        </p>
        <form action="https://formspree.io/f/mnppvavw" method="POST" className="space-y-5"
          onSubmit={(event) => {
            const form = event.currentTarget;
            const email = form.elements.namedItem("email") as HTMLInputElement;
            const phone = form.elements.namedItem("contact_number") as HTMLInputElement;
            const topic = form.elements.namedItem("request_type") as HTMLSelectElement;
            const upi = form.elements.namedItem("refund_upi_id") as HTMLInputElement | null;
            phone.setCustomValidity("");
            upi?.setCustomValidity("");
            if (!email.value.trim() && !phone.value.trim()) {
              event.preventDefault();
              phone.setCustomValidity("Enter an email address or contact number.");
              phone.reportValidity();
              return;
            }
            if (topic.value === "Refund request" && upi && !upi.value.trim()) {
              event.preventDefault();
              upi.setCustomValidity("Enter your UPI ID so we can process a refund request.");
              upi.reportValidity();
            }
          }}>
          <input type="hidden" name="_subject" value="RankRahasya support request" />
          <p className="text-xs text-muted-foreground">Choose a topic below and we’ll ask only for the details relevant to it. For refunds, provide a UPI ID and at least one contact method. Never share your UPI PIN or OTP.</p>
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Your name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Enter your name" />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email address <span className="font-normal text-muted-foreground">(provide email or contact number)</span></label>
            <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">Contact number <span className="font-normal text-muted-foreground">(provide email or contact number)</span></label>
            <input id="contact-phone" name="contact_number" type="tel" autoComplete="tel" maxLength={25}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Your phone number" />
          </div>
          <div>
            <label htmlFor="contact-type" className="mb-2 block text-sm font-medium">What do you need help with?</label>
            <select id="contact-type" name="request_type" required value={requestType} onChange={(event) => setRequestType(event.target.value)}
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
          {requestType === "Refund request" && (
            <div>
              <label htmlFor="contact-upi" className="mb-2 block text-sm font-medium">UPI ID <span className="text-muted-foreground">(required for refunds)</span></label>
              <input id="contact-upi" name="refund_upi_id" type="text" required maxLength={100}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="name@bank" />
              <p className="mt-2 text-xs text-muted-foreground">Never provide your UPI PIN, OTP, or banking password.</p>
            </div>
          )}
          {["Refund request", "Payment issue", "Report issue"].includes(requestType) && (
            <div>
              <label htmlFor="contact-payment" className="mb-2 block text-sm font-medium">Razorpay payment ID or order ID <span className="font-normal text-muted-foreground">(if available)</span></label>
              <input id="contact-payment" name="payment_or_order_id" type="text" maxLength={120}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Found on your payment receipt or SMS" />
              <p className="mt-2 text-xs text-muted-foreground">Never enter card details, OTPs, passwords or your UPI PIN.</p>
            </div>
          )}
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