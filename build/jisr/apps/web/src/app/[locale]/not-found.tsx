import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <main id="main" className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{t("notFound")}</h1>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-on-primary">
        {t("home")}
      </Link>
    </main>
  );
}
