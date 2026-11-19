import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, buildUrl, findReferralId, type Episode } from "./api";

class MemStorage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

describe("api client", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    const sessionStorage = new MemStorage();
    sessionStorage.setItem(
      "jisr.auth",
      JSON.stringify({ token: "tok-123", role: "person", persona: "mariam", expiresAt: Date.now() + 60000 }),
    );
    vi.stubGlobal("window", { sessionStorage, dispatchEvent: () => true });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("sends bearer token and an Idempotency-Key on API-03", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ session_id: "s", crisis: false }), { status: 200 }));
    await api.completeScreening("s1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/v1/screenings/s1/complete");
    expect(init.headers.Authorization).toBe("Bearer tok-123");
    expect(init.headers["Idempotency-Key"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.parse(init.body)).toEqual({ request_support: false });
  });

  it("does not send a token to demo-login", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ access_token: "a", token_type: "Bearer", expires_in: 3600, role: "person", scopes: [] }), { status: 200 }),
    );
    await api.demoLogin("mariam", "pass");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("raises ApiError with the problem+json code (423 LOCKED_CRISIS)", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ type: "about:blank", title: "Locked", status: 423, code: "LOCKED_CRISIS" }), { status: 423 }),
    );
    const err = await api.explain({ episode_id: "e", kind: "result", language: "en" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(423);
    expect((err as ApiError).code).toBe("LOCKED_CRISIS");
  });

  it("falls back to the quoted last_event_seq when ETag is not exposed", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "e", state: "STEP_RECOMMENDED", is_red: false, timeline: [], last_event_seq: 7 }), { status: 200 }),
    );
    const { etag } = await api.getEpisode("e");
    expect(etag).toBe(`"7"`);
  });

  it("builds query strings and drops empty values", () => {
    expect(buildUrl("/v1/programme/fairness", { metric: "conversion", by: "sex", x: undefined })).toBe(
      "http://localhost:8000/v1/programme/fairness?metric=conversion&by=sex",
    );
  });

  it("finds a referral id from several shapes, else the fallback", () => {
    const base: Episode = { id: "e", state: "REFERRED", is_red: false, timeline: [], last_event_seq: 1 };
    expect(findReferralId({ ...base, active_referral_id: "r1" }, null)).toBe("r1");
    expect(findReferralId({ ...base, referrals: [{ id: "r0" }, { id: "r2" }] }, null)).toBe("r2");
    expect(
      findReferralId(
        { ...base, timeline: [{ seq: 1, type: "REFERRED", actor_type: "person", occurred_at: "x", data: { referral_id: "r3" } }] },
        null,
      ),
    ).toBe("r3");
    expect(findReferralId(base, "stored")).toBe("stored");
  });
});
