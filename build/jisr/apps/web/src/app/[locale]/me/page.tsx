import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { HomeView } from "@/components/person/HomeView";

export default async function Page({ params }: PageProps<"/[locale]/me">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <HomeView />
      </RequireRole>
    </PersonShell>
  );
}
