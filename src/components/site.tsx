import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

export function Emblem({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M24 3v6M24 39v6M3 24h6M39 24h6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M30 14a11 11 0 1 0 0 20 9 9 0 1 1 0-20Z" fill="currentColor" />
      <path d="M33 20l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2 text-gold">
      <Emblem className="h-7 w-7" />
      <span className="font-serif text-2xl font-semibold tracking-wide">RankRahasya</span>
    </Link>
  );
}

const NAV = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Wordmark />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-gold" activeProps={{ className: "text-gold" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/start" className="rounded-full bg-gold-gradient px-4 py-2 font-semibold text-primary-foreground">
            Get my report
          </Link>
        </nav>
        <button className="text-gold md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-muted-foreground">
              {n.label}
            </Link>
          ))}
          <Link to="/start" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-gold-gradient py-3 text-center font-semibold text-primary-foreground">
            Get my report
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted-foreground">
        <Wordmark />
        <p className="mt-4 max-w-xl">
          An astrology-inspired self-reflection experience for students. Not scientific prediction. We do not predict or
          guarantee exam ranks or results.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/privacy" className="hover:text-gold">Privacy</Link>
          <Link to="/terms" className="hover:text-gold">Terms</Link>
          <Link to="/refund" className="hover:text-gold">Refund policy</Link>
          <Link to="/contact" className="hover:text-gold">Contact</Link>
        </div>
        <p className="mt-6 text-xs">© {new Date().getFullYear()} RankRahasya</p>
      </div>
    </footer>
  );
}

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold-soft p-4 text-sm text-foreground">
      <strong className="text-gold">Please note: </strong>
      {compact
        ? "Astrology-inspired reflection only — not a scientific prediction, and it does not predict or guarantee any exam rank or result."
        : "RankRahasya is astrology-inspired reflection for entertainment and self-discovery. It is not scientifically proven, is not a prediction, and does not predict or guarantee any exam rank or result. Your study effort and guidance from qualified teachers matter far more."}
    </div>
  );
}

export function Page({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-10 sm:pt-16">
      {kicker && <p className="text-xs uppercase tracking-[0.25em] text-gold">{kicker}</p>}
      <h1 className="mt-2 text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </main>
  );
}

export function seo(title: string, description: string, extra: { noindex?: boolean } = {}) {
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
  if (extra.noindex) meta.push({ name: "robots", content: "noindex" });
  return { meta };
}