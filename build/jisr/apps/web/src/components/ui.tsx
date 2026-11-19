import type { ReactNode } from "react";

/** Shared class strings: every interactive control is >= 44px (SC 2.5.8 / ACCESSIBILITY.md). */
export const btn = {
  primary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pill px-6 py-3 text-base font-semibold text-on-pill shadow-[0_8px_24px_-12px_rgba(22,22,29,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(59,53,181,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2 text-base font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-base font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60",
  accent:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] disabled:cursor-not-allowed disabled:opacity-50",
  help: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-help px-5 py-3 text-base font-semibold text-on-help shadow-lg",
  danger:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red px-5 py-2 font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60",
  chip:
    "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-soft hover:text-primary disabled:opacity-50",
};

export const input =
  "block min-h-11 w-full rounded-2xl border border-line-strong/60 bg-surface px-4 py-2 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-primary";

export function Card({ children, className = "", lift = false }: { children: ReactNode; className?: string; lift?: boolean }) {
  return <section className={`card p-5 sm:p-6 ${lift ? "lift" : ""} ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "sim" | "ai" | "ok" | "red" | "primary" | "coral"; className?: string }) {
  const tones = {
    neutral: "bg-surface-muted text-ink-muted border-line",
    sim: "bg-amber-bg text-amber border-amber/20",
    ai: "bg-ai-bg text-ai border-ai/20",
    ok: "bg-green-bg text-green border-green/20",
    red: "bg-red-bg text-red border-red/20",
    primary: "bg-primary-soft text-primary border-primary/20",
    coral: "bg-coral-soft text-coral border-coral/20",
  } as const;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export function Alert({
  children,
  tone = "info",
  role,
}: {
  children: ReactNode;
  tone?: "info" | "error" | "success" | "warn";
  role?: "alert" | "status";
}) {
  const tones = {
    info: "border-line bg-surface-muted text-ink",
    error: "border-red bg-red-bg text-red",
    success: "border-green bg-green-bg text-green",
    warn: "border-amber bg-amber-bg text-amber",
  } as const;
  return (
    <div role={role ?? (tone === "error" ? "alert" : "status")} className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-ink-muted">
      <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </span>
  );
}

/** Icons (inline SVG, lucide-like strokes): decorative unless labelled by text. */
export function Icon({ name, className = "size-4" }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}

const paths = {
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
    </>
  ),
  sparkles: <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 3v4M21 5h-4" />,
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  alert: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  door: <path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.6v16.8a1 1 0 0 1-1.2 1L5 21V5.6a2 2 0 0 1 1.5-1.9l5-1.4A1 1 0 0 1 13 3.3z" />,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />,
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  chart: <path d="M3 3v18h18M7 15l4-4 3 3 6-6" />,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  play: <path d="M6 4l14 8-14 8z" />,
  bridge: <path d="M2 18h20M4 18V10M20 18V10M2 10c4 0 6-4 10-4s6 4 10 4M8 18v-5M12 18v-7M16 18v-5" />,
  map: <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  stethoscope: (
    <>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
} as const;
