import type { QueueItem } from "./api";

/** "mm:ss" while under an hour, "h:mm h" above; negative = overdue. */
export function formatRemaining(ms: number): { text: string; overdue: boolean } {
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const text = h > 0 ? `${h}:${pad(m)} h` : `${pad(m)}:${pad(s)}`;
  return { text, overdue };
}

export type SlaTone = "neutral" | "amber" | "red";

/** Neutral > 25 % remaining, amber <= 25 %, red at breach (UI_SPEC S-21). */
export function slaTone(remainingMs: number, totalMs: number): SlaTone {
  if (remainingMs < 0) return "red";
  if (totalMs > 0 && remainingMs / totalMs <= 0.25) return "amber";
  return "neutral";
}

export const RED_ACK_MS = 15 * 60 * 1000;

/** Unacknowledged RED: the backend's `red_open` when present, else a RED with a crisis_ack deadline. */
export function isUnackedRed(i: QueueItem): boolean {
  if (typeof i.red_open === "boolean") return i.red_open;
  return i.is_red && i.deadline?.kind === "crisis_ack";
}

function dueMs(i: QueueItem): number {
  return i.deadline?.due_at ? Date.parse(i.deadline.due_at) : Number.POSITIVE_INFINITY;
}

/** RED first (soonest deadline first), then overdue, then by SLA remaining. */
export function sortQueue(items: QueueItem[], now = Date.now()): QueueItem[] {
  const rank = (i: QueueItem) => {
    if (isUnackedRed(i)) return 0; // unacknowledged RED
    if (i.is_red) return 1;
    if (i.deadline?.overdue || dueMs(i) < now) return 2;
    return 3;
  };
  return [...items].sort((a, b) => rank(a) - rank(b) || dueMs(a) - dueMs(b));
}
