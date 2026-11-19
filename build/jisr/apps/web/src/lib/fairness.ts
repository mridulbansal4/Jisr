import type { FairnessRow } from "./api";

export interface CellView {
  suppressed: boolean;
  n: string;
  value: string;
}

/** Suppressed cells never show a value, whatever the payload contains. */
export function fairnessCell(row: FairnessRow, suppressedLabel: string, metric: string): CellView {
  if (row.suppressed || row.suppression) {
    return { suppressed: true, n: suppressedLabel, value: suppressedLabel };
  }
  return { suppressed: false, n: row.n ?? "n/a", value: formatMetric(row.value, metric) };
}

export function formatMetric(v: number | null | undefined, metric: string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "n/a";
  if (metric === "time_to_care") return `${round1(v)} d`;
  // conversion / reliable_improvement: accept 0..1 or 0..100
  const pct = v <= 1 ? v * 100 : v;
  return `${round1(pct)}%`;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}
