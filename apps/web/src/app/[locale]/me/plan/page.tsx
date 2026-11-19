import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { PlanView } from "@/components/person/PlanView";

export default async function Page({ params, searchParams }: PageProps<"/[locale]/me/plan">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("plan");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <PlanView justSent={sp.sent === "1"} />
      </RequireRole>
    </PersonShell>
  );
}
