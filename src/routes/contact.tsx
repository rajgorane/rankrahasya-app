import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, seo } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact — RankRahasya", "Contact the RankRahasya team."),
  component: Contact,
});

function Contact() {
  const [requestType, setRequestType] = useState("");
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  return (
    <Page title="Contact us" kicker="We’re here to help">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Send us a message and we’ll get back to you within 3 working days.
        </p>
        <form action="https://formspree.io/f/mnppvavw" method="POST" className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const email = form.elements.namedItem("email") as HTMLInputElement;
            const phone = form.elements.namedItem("contact_number") as HTMLInputElement;
            const topic = form.elements.namedItem("request_type") as HTMLSelectElement;
            const upi = form.elements.namedItem("refund_upi_id") as HTMLInputElement | null;
            phone.setCustomValidity("");
            upi?.setCustomValidity("");
            if (!email.value.trim() && !phone.value.trim()) {
              phone.setCustomValidity("Enter an email address or contact number.");
              phone.reportValidity();
              return;
            }
            if (topic.value === "Refund request" && upi && !upi.value.trim()) {
              upi.setCustomValidity("Enter your UPI ID so we can process a refund request.");
              upi.reportValidity();
              return;
            }
            setSubmissionState("sending");
            setFormMessage("");
            try {
              const response = await fetch("https://formspree.io/f/mnppvavw", {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
              });
              if (!response.ok) throw new Error("Form submission failed");
              setSubmissionState("success");
              setFormMessage("Thanks for contacting us. We’ll get back to you within 3 working days.");
              form.reset();
              setRequestType("");
            } catch {
              setSubmissionState("error");
              setFormMessage("We couldn’t confirm your message was sent. Please check your connection and try again.");
            }
          }}>
          <input type="hidden" name="_subject" value="RankRahasya support request" />
          {submissionState !== "idle" && (
            <div role="status" aria-live="polite" className={submissionState === "success" ? "rounded-xl border border-green-600/30 bg-green-600/10 p-4 text-sm" : submissionState === "error" ? "rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm" : "rounded-xl border border-border bg-muted p-4 text-sm"}>
              {submissionState === "sending" ? "Sending your message…" : formMessage}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Please provide an email address or contact number so we can reply.</p>
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Your name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Enter your name" />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">Contact number</label>
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
            <label htmlFor="contact-details" className="mb-2 block text-sm font-medium">Message</label>
            <textarea id="contact-details" name="message" required minLength={10} maxLength={5000} rows={6}
              className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground"
              placeholder="How can we help?" />
          </div>
          <button type="submit" disabled={submissionState === "sending"} className="w-full rounded-full bg-gold-gradient px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
            {submissionState === "sending" ? "Sending…" : submissionState === "success" ? "Send another message" : "Send support request"}
          </button>
        </form>
        
      </div>
    </Page>
  );
}