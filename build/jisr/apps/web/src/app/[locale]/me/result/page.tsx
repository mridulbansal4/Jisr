import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { ResultView } from "@/components/person/ResultView";

export default async function Page({ params }: PageProps<"/[locale]/me/result">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("result");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <ResultView />
      </RequireRole>
    </PersonShell>
  );
}
