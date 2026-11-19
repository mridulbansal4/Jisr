import { describe, expect, it } from "vitest";
import { orderCrisisLines, parseUrgency } from "./crisis";
import { isCrisisItem, isDifficultyItem, mergeItems, optionsFor } from "./instrument";
import { formatRemaining, slaTone, sortQueue, RED_ACK_MS } from "./sla";
import { fairnessCell, formatMetric } from "./fairness";
import type { QueueItem, ScreeningItem } from "./api";

describe("crisis line ordering", () => {
  it("puts 999 first for emergencies and for unknown urgency (fail-safe)", () => {
    expect(orderCrisisLines("emergency").map((l) => l.number)).toEqual(["999", "800 725462", "800 4673"]);
    expect(orderCrisisLines(undefined)[0].tel).toBe("tel:999");
    expect(orderCrisisLines("something-new")[0].tel).toBe("tel:999");
  });
  it("leads with 800-SAKINA for a same-day check but still lists 999", () => {
    const lines = orderCrisisLines("same_day_check");
    expect(lines[0].tel).toBe("tel:800725462");
    expect(lines.map((l) => l.tel)).toContain("tel:999");
  });
  it("parses urgency strictly", () => {
    expect(parseUrgency("same_day_check")).toBe("same_day_check");
    expect(parseUrgency(null)).toBe("emergency");
    expect(parseUrgency("garbage")).toBe("emergency");
  });
});

describe("instrument helpers", () => {
  const item = (link_id: string, instrument: ScreeningItem["instrument"] = "PHQ9"): ScreeningItem => ({
    link_id,
    instrument,
    text: "x",
    options: [0, 1, 2, 3],
  });
  it("detects PHQ-9 item 9 across link-id styles", () => {
    expect(isCrisisItem(item("PHQ9_9"))).toBe(true);
    expect(isCrisisItem(item("phq_9"))).toBe(true);
    expect(isCrisisItem(item("PHQ9_19"))).toBe(false);
    expect(isCrisisItem(item("PHQ9_10"))).toBe(false);
    expect(isCrisisItem(item("GAD7_9", "GAD7"))).toBe(false);
  });
  it("uses the difficulty scale for the functional item", () => {
    expect(isDifficultyItem(item("phq_10"))).toBe(true);
    expect(optionsFor(item("phq_10"))[3].labelEn).toBe("Extremely difficult");
    expect(optionsFor(item("PHQ9_1"))[1].labelEn).toBe("Several days");
  });
  it("merges next_items without asking twice", () => {
    const merged = mergeItems([item("PHQ9_1"), item("PHQ9_2")], [item("PHQ9_2"), item("PHQ9_3")]);
    expect(merged.map((i) => i.link_id)).toEqual(["PHQ9_1", "PHQ9_2", "PHQ9_3"]);
  });
});

describe("SLA", () => {
  it("formats remaining and overdue time", () => {
    expect(formatRemaining(13 * 60 * 1000 + 52 * 1000)).toEqual({ text: "13:52", overdue: false });
    expect(formatRemaining(-(2 * 3600 + 14 * 60) * 1000)).toEqual({ text: "2:14 h", overdue: true });
  });
  it("turns amber at <=25% and red at breach", () => {
    expect(slaTone(10 * 60 * 1000, RED_ACK_MS)).toBe("neutral");
    expect(slaTone(3 * 60 * 1000, RED_ACK_MS)).toBe("amber");
    expect(slaTone(-1, RED_ACK_MS)).toBe("red");
  });
  it("pins RED on top of the queue, soonest first", () => {
    const now = Date.parse("2026-11-19T10:00:00Z");
    const q = (id: string, red: boolean, due: string | null, kind: "crisis_ack" | "referral_accept" = "referral_accept"): QueueItem => ({
      episode_id: id,
      person_label: id,
      state: red ? "RED_CRISIS" : "REFERRED",
      is_red: red,
      reason: "r",
      deadline: due ? { kind, due_at: due } : null,
    });
    const sorted = sortQueue(
      [
        q("routine", false, "2026-11-19T09:00:00Z"),
        q("red-late", true, "2026-11-19T10:14:00Z", "crisis_ack"),
        q("none", false, null),
        q("red-soon", true, "2026-11-19T10:05:00Z", "crisis_ack"),
        q("future", false, "2026-11-20T10:00:00Z"),
      ],
      now,
    );
    expect(sorted.map((s) => s.episode_id)).toEqual(["red-soon", "red-late", "routine", "future", "none"]);
  });
});

describe("fairness suppression", () => {
  it("never shows a value for a suppressed cell, even if the payload carries one", () => {
    const cell = fairnessCell({ group: "x", n: "7", value: 0.42, suppressed: true, suppression: "primary" }, "<10, hidden", "conversion");
    expect(cell).toEqual({ suppressed: true, n: "<10, hidden", value: "<10, hidden" });
  });
  it("treats complementary suppression as suppressed", () => {
    expect(fairnessCell({ group: "y", n: "40", value: 0.5, suppressed: false, suppression: "complementary" }, "S", "conversion").suppressed).toBe(true);
  });
  it("formats metrics", () => {
    expect(formatMetric(0.473, "conversion")).toBe("47.3%");
    expect(formatMetric(61, "conversion")).toBe("61.0%");
    expect(formatMetric(6.25, "time_to_care")).toBe("6.3 d");
    expect(formatMetric(null, "conversion")).toBe("n/a");
  });
});

import { reliableIndexes } from "./trajectory";
import { isUnackedRed } from "./sla";

describe("trajectory reliable change", () => {
  it("marks points whose change from baseline meets the RCI threshold", () => {
    expect([...reliableIndexes([17, 14, 11, 9], 6)]).toEqual([2, 3]);
  });
  it("handles missing baseline or threshold", () => {
    expect(reliableIndexes([null, 5], 6).size).toBe(0);
    expect(reliableIndexes([10, 2], undefined).size).toBe(0);
  });
});

describe("unacknowledged RED", () => {
  const base = { episode_id: "e", person_label: "x", state: "RED_CRISIS" as const, reason: "r" };
  it("prefers the backend red_open flag", () => {
    expect(isUnackedRed({ ...base, is_red: true, red_open: false, deadline: { kind: "crisis_ack", due_at: "2026-01-01T00:00:00Z" } })).toBe(false);
    expect(isUnackedRed({ ...base, is_red: true, red_open: true })).toBe(true);
  });
  it("falls back to a RED with a crisis_ack deadline", () => {
    expect(isUnackedRed({ ...base, is_red: true, deadline: { kind: "crisis_ack", due_at: "2026-01-01T00:00:00Z" } })).toBe(true);
  });
});
