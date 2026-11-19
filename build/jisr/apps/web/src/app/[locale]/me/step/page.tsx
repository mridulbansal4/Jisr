import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { StepView } from "@/components/person/StepView";

export default async function Page({ params }: PageProps<"/[locale]/me/step">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("step");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <StepView />
      </RequireRole>
    </PersonShell>
  );
}
