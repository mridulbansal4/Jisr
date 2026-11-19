import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Aurora, PageFade } from "./motion";
import { Icon } from "./ui";

export function StaffShell({ title, children, area = "staff" }: { title: string; children: ReactNode; area?: "staff" | "programme" }) {
  const tn = useTranslations("nav");
  const links =
    area === "programme"
      ? ([
          { href: "/programme", label: tn("dashboard"), icon: "chart" },
          { href: "/safety", label: tn("safety"), icon: "shield" },
        ] as const)
      : ([
          { href: "/staff", label: tn("queue"), icon: "users" },
          { href: "/safety", label: tn("safety"), icon: "shield" },
        ] as const);
  return (
    <div className="relative isolate min-h-[calc(100dvh-3.5rem)]">
      <Aurora variant="corner" className="h-[360px] opacity-40" />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5">
          <span className="text-base font-semibold tracking-tight">{title}</span>
          <nav className="ms-auto flex gap-1 rounded-full border border-line bg-surface/70 p-1" aria-label={title}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink">
                <Icon name={l.icon} className="size-4" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        <PageFade>{children}</PageFade>
      </main>
    </div>
  );
}
