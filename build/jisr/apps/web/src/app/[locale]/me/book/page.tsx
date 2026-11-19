import { getTranslations, setRequestLocale } from "next-intl/server";
import { PersonShell } from "@/components/PersonShell";
import { RequireRole } from "@/components/RequireRole";
import { BookView } from "@/components/person/BookView";

export default async function Page({ params }: PageProps<"/[locale]/me/book">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book");
  return (
    <PersonShell title={t("title")}>
      <RequireRole roles={["person"]}>
        <BookView />
      </RequireRole>
    </PersonShell>
  );
}
