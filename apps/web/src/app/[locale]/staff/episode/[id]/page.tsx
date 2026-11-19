import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireRole } from "@/components/RequireRole";
import { StaffShell } from "@/components/StaffShell";
import { EpisodeConsole } from "@/components/staff/EpisodeConsole";

export default async function Page({ params, searchParams }: PageProps<"/[locale]/staff/episode/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const label = typeof sp.label === "string" ? sp.label : null;
  const t = await getTranslations("staff");
  return (
    <StaffShell title={t("episode.title")}>
      <RequireRole roles={["clinician", "coordinator"]} forbiddenText={t("forbidden")}>
        <EpisodeConsole episodeId={id} label={label} />
      </RequireRole>
    </StaffShell>
  );
}
