"""Release gate (BRD §9.3): block deployment unless the danger model meets its recall bars.

Reads the committed model metadata (no data/torch needed) and fails non-zero if venomous recall
is below the configured minimums. Run in CI before any deploy:

    python scripts/check_release_gate.py

Bars are env-overridable. Defaults reflect the PROTOTYPE posture (test=0.98, hardcase=0.90).
For PRODUCTION, set GATE_HARDCASE_MIN=0.98 — at which point the current model intentionally fails
until the backbone fine-tune closes the hard-case gap.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

META = Path(__file__).resolve().parents[1] / "models" / "bioclip_danger_v1.meta.json"
TEST_MIN = float(os.environ.get("GATE_TEST_MIN", "0.98"))
HARDCASE_MIN = float(os.environ.get("GATE_HARDCASE_MIN", "0.90"))


def main() -> int:
    if not META.exists():
        print(f"::error::Model metadata missing: {META}. Run `python -m faunari.training.export`.")
        return 2
    meta = json.loads(META.read_text(encoding="utf-8"))
    recall_test = float(meta["recall_test"])
    recall_hardcase = float(meta["recall_hardcase"])
    passed = recall_test >= TEST_MIN and recall_hardcase >= HARDCASE_MIN

    print(f"venomous recall — test={recall_test} (min {TEST_MIN}) | "
          f"hardcase={recall_hardcase} (min {HARDCASE_MIN})")
    if passed:
        print("RELEASE GATE: PASS")
        return 0
    print("::error::RELEASE GATE: FAIL — model does not meet the venomous-recall bar; deployment blocked.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
