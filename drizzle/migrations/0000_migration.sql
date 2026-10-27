CREATE TABLE public.report_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL UNIQUE,
  mode text NOT NULL CHECK (mode IN ('live','demo')),
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','demo')),
  amount_paise integer NOT NULL DEFAULT 1000,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  answers jsonb NOT NULL,
  report jsonb,
  report_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT ALL ON public.report_orders TO service_role;
ALTER TABLE public.report_orders ENABLE ROW LEVEL SECURITY;
-- No policies: accessed only from server code with the service role.