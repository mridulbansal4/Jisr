import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

function keys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    k === "_meta" ? [] : keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("messages", () => {
  it("ar has exactly the same keys as en", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });
  it("ar is marked as a draft needing native review", () => {
    expect(ar._meta.status).toBe("machine_draft");
  });
  it("crisis numbers are never translated away", () => {
    expect(ar.crisis.names.sakina).toContain("800-SAKINA");
    expect(ar.crisis.names.hope).toContain("800-HOPE");
    expect(en.crisis.names.emergency).not.toMatch(/\d/); // number comes from lib/crisis.ts, never from copy
  });
  it("copy makes no diagnosis/therapy claim", () => {
    const text = JSON.stringify(en).toLowerCase();
    expect(text).not.toMatch(/you have (depression|anxiety)|we diagnose|our therapy|clinically validated/);
  });
});
