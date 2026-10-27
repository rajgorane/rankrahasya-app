<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Report orders live in `report_orders` with RLS on and no policies; only server code (supabaseAdmin inside handlers) touches it, and the private `access_token` is the reader's capability. Why: no login in v1.
- Price comes only from `PRICE_PAISE` in `src/lib/report.ts`; server never trusts client amounts and fulfils only after HMAC + Razorpay API verification or a signed webhook, via idempotent `fulfilOrder`.
- Missing Razorpay keys = demo mode (clearly labelled, never claims payment). Reports are rules-based; OpenAI polish is optional server-side only.