import { setRequestLocale } from "next-intl/server";
import { JudgeLanding } from "@/components/JudgeLanding";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JudgeLanding defaultPasscode={process.env.NEXT_PUBLIC_JUDGE_PASSCODE || "jisr-demo"} />;
}
