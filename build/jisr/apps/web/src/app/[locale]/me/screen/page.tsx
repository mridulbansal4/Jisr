import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { ScreeningFlow } from "@/components/person/ScreeningFlow";

export default async function Page({ params }: PageProps<"/[locale]/me/screen">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <ScreeningFlow />
      </RequireRole>
    </PersonShell>
  );
}
