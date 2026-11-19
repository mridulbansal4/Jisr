"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth, useHydrated } from "@/lib/hooks";
import { Alert, Spinner, btn } from "./ui";

/** UX-only role guard; the API enforces scopes. */
export function RequireRole({ roles, children, forbiddenText }: { roles: string[]; children: ReactNode; forbiddenText?: string }) {
  const t = useTranslations("common");
  const hydrated = useHydrated();
  const auth = useAuth();
  if (!hydrated) return <Spinner label={t("loading")} />;
  if (!auth || !roles.includes(auth.role)) {
    return (
      <div className="space-y-4">
        <Alert tone="info">{auth ? (forbiddenText ?? t("sessionExpired")) : t("sessionExpired")}</Alert>
        <Link href="/" className={btn.primary}>
          {t("toJudge")}
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
