import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { CompanionChat } from "@/components/person/CompanionChat";

export default async function Page({ params }: PageProps<"/[locale]/me/companion">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companion");
  return (
    <PersonShell title={t("title")} wide>
      <RequireRole roles={["person"]}>
        <CompanionChat />
      </RequireRole>
    </PersonShell>
  );
}
