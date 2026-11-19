import { setRequestLocale } from "next-intl/server";
import { SafetyView } from "@/components/safety/SafetyView";

export default async function Page({ params }: PageProps<"/[locale]/safety">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SafetyView />;
}
