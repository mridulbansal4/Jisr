import { defineRouting } from "next-intl/routing";

// Urdu (ur) is cut from the MVP web build; ar + en ship. See messages/ar.json _meta.
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

export const rtlLocales: readonly string[] = ["ar", "ur"];
export function dirFor(locale: string): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
