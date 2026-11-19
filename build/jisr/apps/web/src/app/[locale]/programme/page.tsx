import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireRole } from "@/components/RequireRole";
import { StaffShell } from "@/components/StaffShell";
import { ProgrammeDashboard } from "@/components/programme/ProgrammeDashboard";

export default async function Page({ params }: PageProps<"/[locale]/programme">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("programme");
  return (
    <StaffShell title={t("title")} area="programme">
      <RequireRole roles={["programme", "judge"]} forbiddenText={t("forbidden")}>
        <ProgrammeDashboard />
      </RequireRole>
    </StaffShell>
  );
}
