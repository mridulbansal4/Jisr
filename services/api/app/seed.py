"""Synthetic demo data (no real people). Run: uv run python -m app.seed"""

from __future__ import annotations

import random
from datetime import timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.db import Base, SessionLocal, engine, iso, now
from app.ledger import CONSENT_SCOPES, append, notify
from app.models import (
    CohortRecord,
    Consent,
    Episode,
    Person,
    Provider,
    Recommendation,
    Referral,
    StaffUser,
)

PROVIDERS: list[dict[str, Any]] = [
    dict(display_name="Al Noor Family Health, Dr Salma Al Hammadi", kind="family_physician",
         steps_served=["L1", "L2"], languages=["ar", "en"], clinician_gender="female",
         modalities=["in_person", "video"], networks=["thiqa", "enhanced"], city="Abu Dhabi", area="abu_dhabi_city",
         current_wait_days=2),
    dict(display_name="Corniche Primary Care, Dr Omar Saeed", kind="family_physician", steps_served=["L1", "L2"],
         languages=["ar", "en"], clinician_gender="male", modalities=["in_person"],
         networks=["thiqa", "basic", "enhanced"], city="Abu Dhabi", area="abu_dhabi_city", current_wait_days=5),
    dict(display_name="Sakina Tele-Wellbeing (video)", kind="tele_mh", steps_served=["L2", "L3"],
         languages=["ar", "en", "ur"], clinician_gender="female", modalities=["video", "phone"],
         networks=["thiqa", "basic", "enhanced"], city="Abu Dhabi", area="abu_dhabi_city", current_wait_days=3),
    dict(display_name="Al Ain Oasis Clinic, Dr Fatima Al Ketbi", kind="family_physician",
         steps_served=["L1", "L2"], languages=["ar"], clinician_gender="female", modalities=["in_person"],
         networks=["thiqa"], city="Al Ain", area="al_ain", current_wait_days=6),
    dict(display_name="Khalifa City Psychology Centre", kind="psychologist", steps_served=["L3"],
         languages=["en", "ar", "ur"], clinician_gender="male", modalities=["in_person", "video"],
         networks=["thiqa", "enhanced", "basic"], city="Abu Dhabi", area="abu_dhabi_city", current_wait_days=9),
    dict(display_name="Mussafah Community Wellbeing Hub", kind="community", steps_served=["L0", "L1"],
         languages=["en", "ur", "ar"], clinician_gender="male", modalities=["in_person", "phone"],
         networks=["basic", "thiqa", "enhanced", "other", "none"], city="Abu Dhabi", area="abu_dhabi_city",
         current_wait_days=1),
    dict(display_name="Al Dhafra Family Medicine, Dr Hessa", kind="family_physician", steps_served=["L1", "L2"],
         languages=["ar", "en"], clinician_gender="female", modalities=["in_person", "video"],
         networks=["thiqa", "basic"], city="Madinat Zayed", area="al_dhafra", current_wait_days=8),
    dict(display_name="Abu Dhabi Specialist Mental Health Service", kind="psychiatry", steps_served=["L3", "L4"],
         languages=["ar", "en"], clinician_gender="male", modalities=["in_person"],
         networks=["thiqa", "enhanced", "basic"], city="Abu Dhabi", area="abu_dhabi_city", current_wait_days=12),
    dict(display_name="Urdu & Hindi Counselling Line (tele)", kind="tele_mh", steps_served=["L1", "L2"],
         languages=["ur", "en"], clinician_gender="male", modalities=["phone", "video"],
         networks=["basic", "enhanced", "other"], city="Abu Dhabi", area="abu_dhabi_city", current_wait_days=2),
    dict(display_name="Al Ain Psychology & Family Centre", kind="psychologist", steps_served=["L3"],
         languages=["ar", "en"], clinician_gender="female", modalities=["in_person", "video"],
         networks=["thiqa", "enhanced"], city="Al Ain", area="al_ain", current_wait_days=10),
]


def _ago(**kw: float):  # type: ignore[no-untyped-def]
    return now() - timedelta(**kw)


def _score(inst: str, total: int, band: str, at, item9: int | None = None) -> dict[str, Any]:  # type: ignore[no-untyped-def]
    d: dict[str, Any] = {"instrument": inst, "total": total, "band": band, "at": iso(at)}
    if inst == "PHQ9":
        d["item9"] = item9 if item9 is not None else 0
    return d


def _consent(db: Session, person_id: str, granted: list[str]) -> None:
    for s in CONSENT_SCOPES:
        db.add(Consent(person_id=person_id, scope=s, status="granted" if s in granted else "revoked"))


def seed_cohort(db: Session, n: int = 1500, seed: int = 42) -> int:
    rng = random.Random(seed)
    start = now() - timedelta(weeks=12)
    nat = [("emirati", 0.22), ("south_asian", 0.38), ("arab_expat", 0.17), ("western", 0.06),
           ("filipino", 0.152), ("other", 0.008)]
    lang_for = {"emirati": "ar", "arab_expat": "ar", "south_asian": "ur", "western": "en", "filipino": "en",
                "other": "en"}
    plan_for = {"emirati": "thiqa"}
    rows = []
    for i in range(n):
        week = i * 12 / n
        at = start + timedelta(days=week * 7 + rng.random() * 6, hours=rng.randint(8, 18))
        group = rng.choices([g for g, _ in nat], [w for _, w in nat])[0]
        lang = lang_for[group] if rng.random() < 0.8 else "en"
        plan = plan_for.get(group) or rng.choices(["basic", "enhanced", "other"], [0.6, 0.3, 0.1])[0]
        area = rng.choices(["abu_dhabi_city", "al_ain", "al_dhafra"], [0.64, 0.28, 0.08])[0]
        age_band = rng.choices(["18-29", "30-44", "45-59", "60+"], [0.33, 0.39, 0.21, 0.07])[0]
        sex = rng.choice(["female", "male"])
        positive = rng.random() < 0.27
        r = CohortRecord(screened_at=at, sex=sex, age_band=age_band, nationality_group=group, language=lang,
                         insurance_plan=plan, area=area, positive=positive)
        if positive:
            ramp = min(1.0, week / 8)  # Jisr rolled out over the period → conversion improves
            r.red = rng.random() < 0.06
            if r.red:
                r.red_ack_minutes = round(max(1.0, rng.gauss(8 - 3 * ramp, 3)), 1)
            r.step = rng.choices(["L1", "L2", "L3", "L4"], [0.18, 0.5, 0.24, 0.08])[0]
            p_ref = 0.62 + 0.25 * ramp
            # Built-in fairness signal: Urdu speakers on basic plans and Al Dhafra convert less
            if lang == "ur" and plan == "basic":
                p_ref -= 0.12
            if area == "al_dhafra":
                p_ref -= 0.1
            r.referred = rng.random() < p_ref
            if r.referred:
                r.accepted = rng.random() < 0.9
                r.accept_hours = round(abs(rng.gauss(30 - 14 * ramp, 12)), 1)
                if r.accepted:
                    r.attended = rng.random() < 0.82 + 0.08 * ramp
                    if r.attended:
                        r.days_to_care = round(max(1.0, rng.gauss(19 - 9 * ramp, 5)), 1)
                        r.rechecked_on_time = rng.random() < 0.6 + 0.25 * ramp
                        r.improved = rng.random() < 0.48
                    else:
                        r.drop_off_reason = "no_show"
                else:
                    r.drop_off_reason = "declined_by_provider"
            else:
                r.drop_off_reason = rng.choices(
                    ["declined_by_person", "unreachable", "cost_or_network", "stigma_concern"],
                    [0.35, 0.3, 0.2, 0.15])[0]
        rows.append(r)
    db.add_all(rows)
    return n


def reset(db: Session, scenario: str = "judge_tour", seed: int = 42) -> dict[str, Any]:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    rng = random.Random(seed)
    provs = [Provider(**p) for p in PROVIDERS]
    db.add_all(provs)
    db.flush()
    salma_provider = provs[0]

    db.add_all([
        StaffUser(persona="dr_salma", name="Dr Salma Al Hammadi", role="clinician", provider_id=salma_provider.id),
        StaffUser(persona="khalid", name="Khalid Al Mansoori", role="coordinator"),
        StaffUser(persona="programme_lead", name="Programme Lead (DoH)", role="programme"),
    ])
    mariam = Person(persona="mariam", label="Mariam A.", sex="female", age=34, nationality_group="emirati",
                    language="ar", area="abu_dhabi_city", insurance_plan="thiqa", clinician_gender="female",
                    modality=["video"], conditions=["Type 2 diabetes (HbA1c above target)"],
                    physical_context={"hba1c_pct": 7.9, "bmi": 29.4, "bp_systolic": 132, "bp_diastolic": 84,
                                      "observed_at": iso(_ago(days=20)), "source": "IFHAS screening (synthetic)"})
    imran = Person(persona="imran", label="Imran K.", sex="male", age=41, nationality_group="south_asian",
                   language="ur", area="abu_dhabi_city", insurance_plan="basic", clinician_gender="none",
                   modality=["phone", "video"], conditions=["Hypertension"],
                   physical_context={"hba1c_pct": 5.6, "bmi": 27.1, "bp_systolic": 146, "bp_diastolic": 92,
                                     "observed_at": iso(_ago(days=60)), "source": "IFHAS screening (synthetic)"})
    db.add_all([mariam, imran])
    db.flush()
    _consent(db, mariam.id, ["ai_drafted_summaries"])
    _consent(db, imran.id, ["share_with_receiving_provider", "share_physical_context", "ai_drafted_summaries"])

    episodes = 0
    # Imran: improving trajectory under L2 tele-MH, now MONITORING
    tele = provs[2]
    t0 = _ago(days=42)
    ep = Episode(person_id=imran.id, state="SCREENED_POSITIVE", opened_at=t0, reason="Positive screen (PHQ-9 17)",
                 score_history=[_score("PHQ9", 17, "moderately_severe", t0), _score("GAD7", 14, "moderate", t0)],
                 fired_rules=["EO-02", "SEV-MAX"], proposed_step="L3")
    db.add(ep)
    db.flush()
    append(db, ep, "SCREENING_COMPLETED", to_state="SCREENED_POSITIVE", actor_type="person", at=t0)
    append(db, ep, "STEP_RECOMMENDED", to_state="STEP_RECOMMENDED", data={"step": "L3"}, at=t0)
    append(db, ep, "STEP_CONFIRMED", to_state="STEP_CONFIRMED", actor_type="staff",
           data={"step": "L2", "reason": "Prefers tele-consult in Urdu; review at re-check"},
           at=t0 + timedelta(hours=20))
    ep.current_step = "L2"
    ep.proposed_step = "L2"
    ref = Referral(episode_id=ep.id, provider_id=tele.id, status="completed", priority="routine",
                   consent_scopes=["share_with_receiving_provider"], sla_due_at=t0 + timedelta(hours=68),
                   created_at=t0 + timedelta(hours=21), decided_at=t0 + timedelta(hours=30))
    db.add(ref)
    append(db, ep, "REFERRAL_CREATED", to_state="REFERRED", data={"provider": tele.display_name},
           at=t0 + timedelta(hours=21))
    append(db, ep, "REFERRAL_ACCEPTED", to_state="ACCEPTED", actor_type="staff", at=t0 + timedelta(hours=30))
    append(db, ep, "APPOINTMENT_BOOKED", to_state="BOOKED", at=t0 + timedelta(days=2))
    append(db, ep, "APPOINTMENT_ATTENDED", to_state="ATTENDED", at=t0 + timedelta(days=5))
    for days, phq, gad, band_p, band_g in [(14, 13, 11, "moderate", "moderate"), (28, 10, 8, "moderate", "mild"),
                                           (40, 8, 6, "mild", "mild")]:
        at = t0 + timedelta(days=days)
        ep.score_history = [*ep.score_history, _score("PHQ9", phq, band_p, at), _score("GAD7", gad, band_g, at)]
        append(db, ep, "RECHECK_COMPLETED", to_state="MONITORING", actor_type="person",
               data={"phq9": phq, "gad7": gad}, at=at)
    notify(db, imran.id, "Your next check-in is ready when you are.", "/me/plan")
    episodes += 1

    # Busy queue: synthetic episodes for Khalid / Dr Salma
    queue_people = [
        ("Noura S.", "female", 27, "emirati", "ar", "thiqa", 16, 12, "STEP_RECOMMENDED", "L3"),
        ("Arjun P.", "male", 38, "south_asian", "en", "basic", 12, 15, "STEP_RECOMMENDED", "L3"),
        ("Grace M.", "female", 31, "filipino", "en", "basic", 11, 9, "REFERRED", "L2"),
        ("Yousef H.", "male", 45, "arab_expat", "ar", "enhanced", 21, 17, "STEP_RECOMMENDED", "L4"),
        ("Aisha R.", "female", 52, "emirati", "ar", "thiqa", 10, 13, "ACCEPTED", "L2"),
    ]
    for label, sex, age, natg, lang, plan, phq, gad, state, step in queue_people:
        p = Person(label=label, sex=sex, age=age, nationality_group=natg, language=lang, insurance_plan=plan)
        db.add(p)
        db.flush()
        _consent(db, p.id, ["share_with_receiving_provider"])
        at = _ago(hours=rng.randint(3, 60))
        e = Episode(person_id=p.id, state="SCREENED_POSITIVE", opened_at=at, proposed_step=step,
                    reason=f"Positive screen (PHQ-9 {phq}, GAD-7 {gad})",
                    score_history=[_score("PHQ9", phq, "moderate", at), _score("GAD7", gad, "moderate", at)],
                    fired_rules=["EO-02", "SEV-MAX"])
        db.add(e)
        db.flush()
        append(db, e, "SCREENING_COMPLETED", to_state="SCREENED_POSITIVE", actor_type="person", at=at)
        append(db, e, "STEP_RECOMMENDED", to_state="STEP_RECOMMENDED", data={"step": step}, at=at)
        db.add(Recommendation(episode_id=e.id, step=step, factors=[]))
        if state in ("REFERRED", "ACCEPTED"):
            e.current_step = step
            append(db, e, "STEP_CONFIRMED", to_state="STEP_CONFIRMED", actor_type="staff", data={"step": step},
                   at=at + timedelta(hours=1))
            prov = provs[1]
            db.add(Referral(episode_id=e.id, provider_id=prov.id, status="requested" if state == "REFERRED"
                            else "accepted", sla_due_at=at + timedelta(hours=49), created_at=at + timedelta(hours=2),
                            consent_scopes=["share_with_receiving_provider"]))
            append(db, e, "REFERRAL_CREATED", to_state="REFERRED", at=at + timedelta(hours=2))
            if state == "ACCEPTED":
                append(db, e, "REFERRAL_ACCEPTED", to_state="ACCEPTED", actor_type="staff",
                       at=at + timedelta(hours=20))
        episodes += 1

    # One existing RED already acknowledged (shows the closed loop), unacknowledged RED comes live from the demo
    p = Person(label="Hamad T.", sex="male", age=23, nationality_group="emirati", language="ar",
               insurance_plan="thiqa")
    db.add(p)
    db.flush()
    at = _ago(hours=5)
    e = Episode(person_id=p.id, state="RED_CRISIS", opened_at=at, is_red=True, red_severity="high",
                red_opened_at=at, red_acked_at=at + timedelta(minutes=6), current_step="RED", proposed_step="RED",
                reason="Crisis Gate: PHQ-9 item 9 positive", fired_rules=["CG-01", "EO-01"],
                score_history=[_score("PHQ9", 19, "moderately_severe", at, item9=2)])
    db.add(e)
    db.flush()
    append(db, e, "CRISIS_GATE_FIRED", to_state="RED_CRISIS", data={"rules": ["CG-01"], "severity": "high"}, at=at)
    append(db, e, "RED_ACKNOWLEDGED", actor_type="staff", data={"ack_latency_seconds": 360, "within_sla": True},
           at=at + timedelta(minutes=6))
    append(db, e, "CONTACT_ATTEMPT", actor_type="staff",
           data={"channel": "phone", "outcome": "reached_safe", "attempt_number": 1}, at=at + timedelta(minutes=9))
    episodes += 1

    n = 0 if scenario == "empty" else seed_cohort(db, 1500, seed)
    db.commit()
    return {"reset_at": iso(now()), "personas": ["judge", "mariam", "imran", "dr_salma", "khalid",
                                                 "programme_lead"],
            "episodes_seeded": episodes, "simulated_cohort": n}


def main() -> None:
    db = SessionLocal()
    try:
        out = reset(db)
        print(f"Seeded: {out} (db={settings.database_url})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
