from app.engines import fairness, rci, scoring
from app.engines.step_matcher import Prefs, StepInput, match, rank_providers
from app.llm import validator


def full_answers(phq: list[int], gad: list[int], diff: int = 1) -> dict[str, int]:
    a = {f"PHQ9_{i + 1}": v for i, v in enumerate(phq)}
    a.update({f"GAD7_{i + 1}": v for i, v in enumerate(gad)})
    a["PHQ9_10"] = diff
    return a


def test_phq9_scoring_and_band():
    s = scoring.score_phq9(full_answers([2, 2, 1, 2, 1, 1, 1, 1, 0], [0] * 7))
    assert (s.total, s.band, s.status, s.item9) == (11, "moderate", "COMPLETE", 0)


def test_phq9_missing_item9_is_never_zero():
    a = full_answers([1] * 8 + [0], [0] * 7)
    del a["PHQ9_9"]
    s = scoring.score_phq9(a)
    assert s.status == "CRISIS_ITEM_UNKNOWN" and s.total is None


def test_prorate_one_missing_and_incomplete_two_missing():
    a = full_answers([1] * 9, [2] * 7)
    del a["GAD7_7"]
    assert scoring.score_gad7(a).status == "PRORATED"
    del a["GAD7_6"]
    assert scoring.score_gad7(a).status == "INCOMPLETE"


def test_invalid_answer_rejected():
    import pytest

    with pytest.raises(scoring.InvalidAnswer):
        scoring.validate_answers({"PHQ9_1": 4})
    with pytest.raises(scoring.InvalidAnswer):
        scoring.validate_answers({"BOGUS": 1})


def test_higher_instrument_wins_mariam_is_L2():
    r = match(StepInput(phq9_total=11, gad7_total=13, phq9_item9=0))
    assert r.level == "L2" and r.state == "SUGGESTED"


def test_below_threshold_no_episode_and_self_referral_opens():
    assert match(StepInput(phq9_total=4, gad7_total=3)).state == "NO_EPISODE"
    r = match(StepInput(phq9_total=6, gad7_total=3, self_referral=True))
    assert r.state == "SUGGESTED" and r.level == "L1"


def test_modifiers_raise_only():
    assert match(StepInput(phq9_total=7, gad7_total=4, self_referral=True, phq9_difficulty=2)).level == "L2"
    assert (
        match(StepInput(phq9_total=7, gad7_total=4, self_referral=True, comorbidity_flag=True)).level == "L2"
    )
    assert match(StepInput(phq9_total=12, gad7_total=16, phq9_difficulty=3)).level == "L4"
    assert (
        match(
            StepInput(phq9_total=12, gad7_total=11, previous_step="L2", rci_status="no_reliable_change")
        ).level
        == "L3"
    )


def test_crisis_short_circuits_to_red():
    assert match(StepInput(phq9_total=3, crisis=True)).level == "RED"


def test_rci():
    assert rci.classify("PHQ9", 17, 8) == "reliable_improvement"
    assert rci.classify("PHQ9", 10, 16) == "reliable_deterioration"
    assert rci.classify("GAD7", 10, 8) == "no_reliable_change"
    assert rci.overall({"PHQ9": "reliable_improvement", "GAD7": "reliable_deterioration"}) == "deteriorated"


def test_provider_ranking_prefers_language_gender_network():
    provs = [
        dict(
            id="a",
            steps_served=["L2"],
            accepting=True,
            networks=["thiqa"],
            languages=["ar"],
            clinician_gender="female",
            modalities=["video"],
            current_wait_days=3,
            area="abu_dhabi_city",
        ),
        dict(
            id="b",
            steps_served=["L2"],
            accepting=True,
            networks=["thiqa"],
            languages=["en"],
            clinician_gender="male",
            modalities=["in_person"],
            current_wait_days=1,
            area="abu_dhabi_city",
        ),
        dict(
            id="c",
            steps_served=["L2"],
            accepting=True,
            networks=["basic"],
            languages=["ar"],
            clinician_gender="female",
            modalities=["video"],
            current_wait_days=0,
            area="abu_dhabi_city",
        ),
    ]
    ranked, _ = rank_providers("L2", Prefs("ar", "female", ["video"], "abu_dhabi_city", "thiqa"), provs)
    assert [p["id"] for p in ranked] == ["a", "b"]  # c is out of network


def test_suppression_primary_and_complementary():
    rows = fairness.suppress([{"group": "x", "n": 120}, {"group": "y", "n": 40}, {"group": "z", "n": 4}])
    sup = {r["group"]: r["suppression"] for r in rows}
    assert sup == {"x": None, "y": "complementary", "z": "primary"}


def test_validator_blocks_unsupported_numbers_and_claims_but_allows_disclaimer():
    facts = {"scores": [{"total": 11}]}
    assert validator.check("Your score is 11. This is not a diagnosis.", facts) == []
    assert "unsupported number '14'" in validator.check("Your score is 14.", facts)
    assert any("diagnosis" in f for f in validator.check("We diagnose you with depression.", facts))
    assert any("guarantee" in f for f in validator.check("This will cure you.", facts))
