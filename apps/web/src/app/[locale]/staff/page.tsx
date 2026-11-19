import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireRole } from "@/components/RequireRole";
import { StaffShell } from "@/components/StaffShell";
import { QueueView } from "@/components/staff/QueueView";

export default async function Page({ params }: PageProps<"/[locale]/staff">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("staff");
  return (
    <StaffShell title={t("title")}>
      <RequireRole roles={["clinician", "coordinator"]} forbiddenText={t("forbidden")}>
        <QueueView />
      </RequireRole>
    </StaffShell>
  );
}
