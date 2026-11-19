"""Jisr evals entry point. Currently runs the crisis-benchmark suite (Dataset A, deterministic gate).

Usage (from ai/evals):
    uv run --project ../../services/api python run_evals.py
    py -3.12 run_evals.py                       # services/api is added to sys.path below

Exit codes: 0 = all gates passed, 1 = crisis recall < 100%, 2 = configuration error (e.g. missing dataset).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
API_DIR = REPO_ROOT / "services" / "api"
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from app.evals_crisis import DEFAULT_BENCHMARK, render_markdown, run_benchmark  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Run the Jisr crisis-gate benchmark.")
    ap.add_argument("--suite", default="crisis", choices=["crisis"], help="only 'crisis' is implemented")
    ap.add_argument("--dataset", type=Path, default=DEFAULT_BENCHMARK)
    ap.add_argument("--report", type=Path, default=REPO_ROOT / "EVAL.md", help="markdown report path")
    ap.add_argument("--json-out", type=Path, default=HERE / "results" / "crisis_latest.json")
    ap.add_argument("--no-write", action="store_true", help="print the summary only")
    args = ap.parse_args(argv)

    if not args.dataset.is_file():
        print(f"config error: dataset not found: {args.dataset}", file=sys.stderr)
        return 2
    try:
        res = run_benchmark(args.dataset)
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 2

    if not args.no_write:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(res, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        args.report.write_text(render_markdown(res), encoding="utf-8")

    # Case ids only: free text is never printed (ai/evals/README.md, data rules).
    c = res["confusion"]
    print(f"crisis benchmark  rules={res['rules_version']}  n={res['n']} "
          f"(RED {res['positives']} / NOT_RED {res['negatives']})")
    print(f"  recall={res['recall']}  precision={res['precision']}  "
          f"tp={c['tp']} fp={c['fp']} fn={c['fn']} tn={c['tn']}  p95={res['latency_p95_ms']}ms")
    for r in res["by_language"]:
        print(f"  {r['lang']:<8} n={r['n']:<3} recall={r['recall']}  precision={r['precision']}")
    if res["false_negatives"]:
        print("  FALSE NEGATIVES: " + ", ".join(f["id"] for f in res["false_negatives"]))
    if res["false_positives"]:
        print("  false positives: " + ", ".join(f["id"] for f in res["false_positives"]))
    if not args.no_write:
        print(f"  wrote {args.report} and {args.json_out}")

    if res["recall"] != 1.0:
        print("GATE FAILED: crisis recall < 100%", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
