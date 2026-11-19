import { setRequestLocale } from "next-intl/server";
import { TourView } from "@/components/TourView";

export default async function Page({ params }: PageProps<"/[locale]/tour">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TourView />;
}
