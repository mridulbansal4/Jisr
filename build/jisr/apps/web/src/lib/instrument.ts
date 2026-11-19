import type { ScreeningItem } from "./api";

/**
 * Response options are part of the validated instrument (PHQ/GAD, public
 * domain English). They are NOT UI chrome and must not be machine-translated,
 * so they live here verbatim instead of in messages/*.json.
 */
export const FREQUENCY_OPTIONS_EN = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
export const DIFFICULTY_OPTIONS_EN = ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"];
export const PHQ_GAD_STEM_EN = "Over the last 2 weeks, how often have you been bothered by any of the following problems?";

/** PHQ-9 item 9 (crisis item). Accepts PHQ9_9, phq_9, PHQ-9-9 … */
export function isCrisisItem(item: Pick<ScreeningItem, "link_id" | "instrument">): boolean {
  if (item.instrument !== "PHQ9") return false;
  return /(^|[^0-9])9$/.test(item.link_id) && !/10$/.test(item.link_id);
}

/** PHQ-9 functional-difficulty item (phq_10 / PHQ9_10 / *DIFF*). */
export function isDifficultyItem(item: Pick<ScreeningItem, "link_id">): boolean {
  return /diff|func|(^|[^0-9])10$/i.test(item.link_id);
}

export interface OptionView {
  value: number | boolean;
  labelEn: string | null; // null => use a UI message (booleans)
}

export function optionsFor(item: ScreeningItem): OptionView[] {
  const scale = isDifficultyItem(item) ? DIFFICULTY_OPTIONS_EN : FREQUENCY_OPTIONS_EN;
  return item.options.map((v) => ({
    value: v,
    labelEn: typeof v === "number" ? (scale[v] ?? String(v)) : null,
  }));
}

/** Merge newly returned items (API-02 next_items) without asking anything twice. */
export function mergeItems(current: ScreeningItem[], incoming: ScreeningItem[] | undefined): ScreeningItem[] {
  if (!incoming || incoming.length === 0) return current;
  const seen = new Set(current.map((i) => i.link_id));
  return [...current, ...incoming.filter((i) => !seen.has(i.link_id))];
}
