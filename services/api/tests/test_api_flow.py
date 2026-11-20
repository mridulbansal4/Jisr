"""End-to-end API flow on a fresh synthetic database (LLM off → templates)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

REST = {
    "PHQ9_3": 1,
    "PHQ9_4": 2,
    "PHQ9_5": 1,
    "PHQ9_6": 1,
    "PHQ9_7": 1,
    "PHQ9_8": 1,
    "PHQ9_9": 0,
    "PHQ9_10": 1,
    "GAD7_3": 2,
    "GAD7_4": 2,
    "GAD7_5": 2,
    "GAD7_6": 2,
    "GAD7_7": 1,
}


@pytest.fixture(scope="module")
def c():
    with TestClient(app) as client:
        h = login(client, "judge")
        assert client.post("/v1/demo/reset", headers=h, json={}).status_code == 200
        yield client


def login(c, persona):
    r = c.post("/v1/auth/demo-login", json={"persona": persona, "passcode": "test-pass"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_wrong_passcode_and_missing_token(c):
    assert c.post("/v1/auth/demo-login", json={"persona": "mariam", "passcode": "x"}).status_code == 401
    r = c.get("/v1/staff/queue")
    assert r.status_code == 401 and r.json()["code"] == "UNAUTHENTICATED"


def test_mariam_journey(c):
    m = login(c, "mariam")
    s = c.post("/v1/screenings", headers=m, json={"language": "en"}).json()
    a = c.post(
        f"/v1/screenings/{s['id']}/answers",
        headers=m,
        json={"answers": {"PHQ9_1": 2, "PHQ9_2": 2, "GAD7_1": 2, "GAD7_2": 2}},
    ).json()
    assert a["stage"] == "full" and len(a["next_items"]) == 13
    c.post(f"/v1/screenings/{s['id']}/answers", headers=m, json={"answers": REST})
    done = c.post(f"/v1/screenings/{s['id']}/complete", headers=m, json={}).json()
    assert done["crisis"] is False and done["episode"]["proposed_step"] == "L2"
    eid = done["episode"]["id"]
    ex = c.post("/v1/explain", headers=m, json={"episode_id": eid, "kind": "result", "language": "en"}).json()
    assert ex["content_type"] == "template" and "not a diagnosis" in ex["sections"]["what_it_does_not_mean"]
    rec = c.get(f"/v1/episodes/{eid}/recommendation", headers=m).json()
    top = rec["candidates"][0]
    assert "ar" in top["languages"] and top["clinician_gender"] == "female" and "thiqa" in top["networks"]
    r = c.post(
        f"/v1/episodes/{eid}/referrals",
        headers=m,
        json={"provider_id": top["id"], "priority": "routine", "consent_scopes": []},
    )
    assert r.status_code == 403 and r.json()["code"] == "CONSENT_REQUIRED"
    r = c.post(
        f"/v1/episodes/{eid}/referrals",
        headers=m,
        json={
            "provider_id": top["id"],
            "priority": "routine",
            "consent_scopes": ["share_with_receiving_provider"],
        },
    )
    assert r.status_code == 201
    assert "physical_context" not in r.json()["packet_preview"]  # not consented

    d = login(c, "dr_salma")
    ep = c.get(f"/v1/episodes/{eid}", headers=d)
    body = ep.json()
    assert ep.headers["etag"] == f'"{body["last_event_seq"]}"' and body["active_referral_id"]
    stale = c.post(
        f"/v1/episodes/{eid}/confirm-step",
        headers={**d, "If-Match": '"0"'},
        json={"recommendation_id": body["recommendation_id"], "step": "L2"},
    )
    assert stale.status_code == 409
    ok = c.post(
        f"/v1/episodes/{eid}/confirm-step",
        headers={**d, "If-Match": ep.headers["etag"]},
        json={"recommendation_id": body["recommendation_id"], "step": "L2"},
    )
    assert ok.json()["current_step"] == "L2"
    h = c.post(f"/v1/episodes/{eid}/handoff-summary", headers=d).json()
    assert h["sentences"] and all(s["sources"] for s in h["sentences"])
    rid = body["active_referral_id"]
    assert (
        c.post(f"/v1/referrals/{rid}/decision", headers=d, json={"decision": "accept"}).json()["status"]
        == "accepted"
    )
    assert (
        c.post(f"/v1/referrals/{rid}/appointment", headers=d, json={"action": "book"}).json()["status"]
        == "booked"
    )
    k = login(c, "khalid")
    assert c.post(f"/v1/episodes/{eid}/confirm-step", headers=k, json={"step": "L3"}).status_code == 403


def test_crisis_from_companion_opens_red_and_locks_ai(c):
    i = login(c, "imran")
    r = c.post(
        "/v1/companion/chat",
        headers=i,
        json={"messages": [{"role": "user", "content": "jeene ka dil nahi karta"}], "language": "ur"},
    ).json()
    assert r["llm_locked"] and r["gate"]["crisis"] and r["episode_id"]
    assert r["crisis_lines"][0]["number"] in ("800 725462", "999")
    k = login(c, "khalid")
    q = c.get("/v1/staff/queue", headers=k).json()
    assert q["items"][0]["red_open"] and q["items"][0]["episode_id"] == r["episode_id"]
    ack = c.post(f"/v1/episodes/{r['episode_id']}/red/ack", headers=k, json={}).json()
    assert ack["within_sla"] is True
    # a clinician must resolve the crisis before stepping down
    d = login(c, "dr_salma")
    assert (
        c.post(f"/v1/episodes/{r['episode_id']}/confirm-step", headers=d, json={"step": "L2"}).status_code
        == 423
    )


def test_item9_positive_is_red(c):
    m = login(c, "mariam")
    s = c.post("/v1/screenings", headers=m, json={"language": "en", "stage": "full"}).json()
    ans = {**{f"PHQ9_{i}": 1 for i in range(1, 9)}, "PHQ9_9": 2, **{f"GAD7_{i}": 1 for i in range(1, 8)}}
    a = c.post(f"/v1/screenings/{s['id']}/answers", headers=m, json={"answers": ans}).json()
    assert a["crisis"] is True
    done = c.post(f"/v1/screenings/{s['id']}/complete", headers=m, json={}).json()
    assert done["crisis"] and done["llm_locked"] and done["episode"]["state"] == "RED_CRISIS"


def test_programme_views(c):
    p = login(c, "programme_lead")
    m = c.get("/v1/programme/metrics", headers=p).json()
    assert m["funnel"]["screened"] == 1500 and m["data_label"] == "SIMULATED"
    f = c.get("/v1/programme/fairness?metric=conversion&by=nationality_group", headers=p).json()
    assert any(r["suppression"] == "primary" for r in f["rows"])
    assert all(r["value"] is None for r in f["rows"] if r["suppressed"])
    a = c.post("/v1/programme/ask", headers=p, json={"question": "Which region is behind?"}).json()
    assert a["intent"] == "geo" and a["chart"]["x"]
    sim = c.post("/v1/sim/run", headers=p, json={"cohort_size": 1000, "seed": 1}).json()
    assert sim["jisr"]["conversion_pct"] > sim["baseline"]["conversion_pct"]
    assert c.get("/v1/staff/queue", headers=p).status_code == 403
