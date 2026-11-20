import { useId } from "react";
import { useTranslations } from "next-intl";

const APPLE_SQUIRCLE =
  "M 42 4 L 86 4 C 105 4, 114 4, 119 9 C 124 14, 124 23, 124 42 L 124 86 C 124 105, 124 114, 119 119 C 114 124, 105 124, 86 124 L 42 124 C 23 124, 14 124, 9 119 C 4 114, 4 105, 4 86 L 4 42 C 4 23, 4 14, 9 9 C 14 4, 23 4, 42 4 Z";

/**
 * Jisr mark (Concept 03 — The Orbital Bridge Arch):
 * Concentric split-bevel parabolic bridge arch (Observed Screen -> Stepped Care),
 * multi-faceted V-chevron cradle, and central brushed Dawn-Gold orbital sphere
 * inside an Apple G2 continuous-curvature squircle plinth.
 */
export function LogoMark({
  className = "size-7",
  squircle = true,
  cables = true,
}: {
  className?: string;
  squircle?: boolean;
  cables?: boolean;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg aria-hidden viewBox="0 0 128 128" className={className}>
      <defs>
        <linearGradient id={`plinth-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="var(--logo-plinth-top)" />
          <stop offset="50%" stopColor="var(--logo-plinth-mid)" />
          <stop offset="100%" stopColor="var(--logo-plinth-bot)" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="38%" cy="8%" r="78%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="48%" stopColor="var(--dawn-b)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>

        {/* Upper Arch Left (Brushed Pearlescent Ivory) */}
        <linearGradient id={`arch-l-out-${uid}`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="var(--logo-arch-l-out-a)" />
          <stop offset="100%" stopColor="var(--logo-arch-l-out-b)" />
        </linearGradient>
        <linearGradient id={`arch-l-in-${uid}`} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="var(--logo-arch-l-in-a)" />
          <stop offset="100%" stopColor="var(--logo-arch-l-in-b)" />
        </linearGradient>

        {/* Upper Arch Right (Anodized Mineral Sea-Teal) */}
        <linearGradient id={`arch-r-out-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="var(--logo-arch-r-out-a)" />
          <stop offset="100%" stopColor="var(--logo-arch-r-out-b)" />
        </linearGradient>
        <linearGradient id={`arch-r-in-${uid}`} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="var(--logo-arch-r-in-a)" />
          <stop offset="100%" stopColor="var(--logo-arch-r-in-b)" />
        </linearGradient>

        {/* Lower V-Chevron Left (Deep Architectural Obsidian) */}
        <linearGradient id={`chev-l-up-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#384046" />
          <stop offset="52%" stopColor="#202529" />
          <stop offset="100%" stopColor="#111417" />
        </linearGradient>
        <linearGradient id={`chev-l-lo-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d2226" />
          <stop offset="100%" stopColor="#090b0d" />
        </linearGradient>

        {/* Lower V-Chevron Right (Specular Mineral Teal) */}
        <linearGradient id={`chev-r-up-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4e3e5" />
          <stop offset="48%" stopColor="#85b5b8" />
          <stop offset="100%" stopColor="#528286" />
        </linearGradient>
        <linearGradient id={`chev-r-lo-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#609094" />
          <stop offset="55%" stopColor="#3a676b" />
          <stop offset="100%" stopColor="#1f3f42" />
        </linearGradient>

        {/* Buttress Wings */}
        <linearGradient id={`wing-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--logo-wing-a)" />
          <stop offset="100%" stopColor="var(--logo-wing-b)" />
        </linearGradient>

        {/* Central Brushed Dawn-Gold Orbital Sphere */}
        <radialGradient id={`orb-${uid}`} cx="50%" cy="50%" r="52%" fx="36%" fy="32%">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="18%" stopColor="#fae5b2" />
          <stop offset="44%" stopColor="#dfb26c" />
          <stop offset="74%" stopColor="#9e6d36" />
          <stop offset="100%" stopColor="#38220f" />
        </radialGradient>

        <filter id={`elev-${uid}`} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0.6" dy="2.8" stdDeviation="2.4" floodColor="#000000" floodOpacity="0.38" />
        </filter>
      </defs>

      {squircle ? (
        <>
          <path d={APPLE_SQUIRCLE} fill={`url(#plinth-${uid})`} />
          <path d={APPLE_SQUIRCLE} fill={`url(#glow-${uid})`} />
          <path d={APPLE_SQUIRCLE} fill="none" stroke="var(--logo-plinth-rim)" strokeWidth="1.5" />
        </>
      ) : null}

      {cables ? (
        <g stroke="var(--logo-cable)" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round">
          <line x1="54" y1="35" x2="54" y2="83" />
          <line x1="59" y1="34" x2="59" y2="88" />
          <line x1="64" y1="33.5" x2="64" y2="92" />
          <line x1="69" y1="34" x2="69" y2="88" />
          <line x1="74" y1="35" x2="74" y2="83" />
        </g>
      ) : null}

      <g filter={`url(#elev-${uid})`}>
        {/* Upper Concentric Split-Bevel Bridge Arch */}
        <path d="M 21 62 A 43 43 0 0 1 64 19 L 64 26.5 A 35.5 35.5 0 0 0 28.5 62 Z" fill={`url(#arch-l-out-${uid})`} />
        <path d="M 28.5 62 A 35.5 35.5 0 0 1 64 26.5 L 64 34.5 A 27.5 27.5 0 0 0 36.5 62 Z" fill={`url(#arch-l-in-${uid})`} />
        <path d="M 64 19 A 43 43 0 0 1 107 62 L 99.5 62 A 35.5 35.5 0 0 0 64 26.5 Z" fill={`url(#arch-r-out-${uid})`} />
        <path d="M 64 26.5 A 35.5 35.5 0 0 1 99.5 62 L 91.5 62 A 27.5 27.5 0 0 0 64 34.5 Z" fill={`url(#arch-r-in-${uid})`} />

        {/* Arch Ridge Highlights */}
        <path d="M 28.5 62 A 35.5 35.5 0 0 1 64 26.5" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.75" />
        <path d="M 64 26.5 A 35.5 35.5 0 0 1 99.5 62" fill="none" stroke="#d4f0f2" strokeOpacity="0.42" strokeWidth="0.75" />

        {/* Outer Buttress Wings */}
        <polygon points="24.5,71 34.5,91.5 49,94 40,85" fill={`url(#wing-${uid})`} />
        <polygon points="103.5,71 93.5,91.5 79,94 88,85" fill={`url(#wing-${uid})`} />

        {/* Lower Multi-Faceted V-Chevron Base */}
        <polygon points="29.8,65.5 39.2,65.5 64,90.3 64,99.7" fill={`url(#chev-l-up-${uid})`} />
        <polygon points="20.5,65.5 29.8,65.5 64,99.7 64,109" fill={`url(#chev-l-lo-${uid})`} />
        <polygon points="64,90.3 88.8,65.5 98.2,65.5 64,99.7" fill={`url(#chev-r-up-${uid})`} />
        <polygon points="64,99.7 98.2,65.5 107.5,65.5 64,109" fill={`url(#chev-r-lo-${uid})`} />

        {/* Chevron Chamfer Highlights */}
        <line x1="29.8" y1="65.5" x2="64" y2="99.7" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="0.7" />
        <line x1="98.2" y1="65.5" x2="64" y2="99.7" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.75" />

        {/* Central Brushed Dawn-Gold Orbital Sphere */}
        <circle cx="64" cy="62.5" r="14.8" fill={`url(#orb-${uid})`} />
        <circle cx="64" cy="62.5" r="14.4" fill="none" stroke="#fff6df" strokeOpacity="0.32" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("common");
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      {compact ? null : <span className="text-lg font-bold tracking-tight">{t("appName")}</span>}
    </span>
  );
}
