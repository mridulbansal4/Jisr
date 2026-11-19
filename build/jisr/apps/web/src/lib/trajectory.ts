/** Reliable change relative to baseline (first point), using the API's RCI thresholds. */
export function reliableIndexes(values: (number | null | undefined)[], threshold: number | undefined): Set<number> {
  const out = new Set<number>();
  const base = values[0];
  if (threshold === undefined || base === null || base === undefined) return out;
  values.forEach((v, i) => {
    if (i > 0 && v !== null && v !== undefined && Math.abs(v - base) >= threshold) out.add(i);
  });
  return out;
}
