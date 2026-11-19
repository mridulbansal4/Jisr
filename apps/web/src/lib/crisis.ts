import type { Urgency } from "./api";

/**
 * Crisis lines are statically bundled (PROJECT_BRIEF §11) so the crisis
 * screen renders with no network. Names/descriptions come from messages.
 */
export type CrisisLineId = "emergency" | "sakina" | "hope";

export interface StaticCrisisLine {
  id: CrisisLineId;
  number: string; // display, always LTR
  tel: string;
}

export const CRISIS_LINES: Record<CrisisLineId, StaticCrisisLine> = {
  emergency: { id: "emergency", number: "999", tel: "tel:999" },
  sakina: { id: "sakina", number: "800 725462", tel: "tel:800725462" },
  hope: { id: "hope", number: "800 4673", tel: "tel:8004673" },
};

/**
 * Order the lines for the situation. 999 comes first unless the server said
 * the trigger warrants a same-day human check (PHQ-9 item 9 = 1, OQ-01).
 * Unknown urgency is treated as an emergency (fail-safe).
 */
export function orderCrisisLines(urgency: Urgency | undefined | string): StaticCrisisLine[] {
  if (urgency === "same_day_check") {
    return [CRISIS_LINES.sakina, CRISIS_LINES.hope, CRISIS_LINES.emergency];
  }
  return [CRISIS_LINES.emergency, CRISIS_LINES.sakina, CRISIS_LINES.hope];
}

export function parseUrgency(v: string | undefined | null): Urgency {
  return v === "same_day_check" ? "same_day_check" : "emergency";
}
