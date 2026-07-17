"""Feedback-flywheel trigger: when total Firestore feedback crosses the next threshold multiple,
open a GitHub issue (which emails the owner) asking for a review batch.

Stateless by design: "batches already announced" = count of GitHub issues labeled
`feedback-review`, so no checkpoint file is needed. Runs in GitHub Actions on a schedule.

Env:
  FIREBASE_SERVICE_ACCOUNT  service-account JSON (repo secret)
  GITHUB_TOKEN              provided by Actions
  GITHUB_REPOSITORY         owner/repo (provided by Actions)
  FEEDBACK_THRESHOLD        records per review batch (default 5)
"""
from __future__ import annotations

import json
import os
import sys

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

PROJECT_ID = "faunari-9bb1c"
LABEL = "feedback-review"
FIRESTORE_URL = (
    f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
    f"/databases/(default)/documents:runAggregationQuery"
)


def firestore_feedback_count() -> int:
    """Total documents in the feedback collection, via an aggregation COUNT (cheap, no doc reads)."""
    raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip().lstrip("﻿")  # BOM from shell piping
    if not raw:
        raise SystemExit("FIREBASE_SERVICE_ACCOUNT secret is empty or unset — re-set it from the key JSON")
    info = json.loads(raw)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/datastore"]
    )
    creds.refresh(Request())
    body = {
        "structuredAggregationQuery": {
            "structuredQuery": {"from": [{"collectionId": "feedback"}]},
            "aggregations": [{"alias": "total", "count": {}}],
        }
    }
    r = requests.post(
        FIRESTORE_URL, json=body, headers={"Authorization": f"Bearer {creds.token}"}, timeout=30
    )
    r.raise_for_status()
    return int(r.json()[0]["result"]["aggregateFields"]["total"]["integerValue"])


def _gh(method: str, path: str, **kwargs) -> requests.Response:
    repo = os.environ["GITHUB_REPOSITORY"]
    return requests.request(
        method,
        f"https://api.github.com/repos/{repo}{path}",
        headers={
            "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}",
            "Accept": "application/vnd.github+json",
        },
        timeout=30,
        **kwargs,
    )


def announced_batches() -> int:
    """How many review batches already have an issue (open or closed)."""
    r = _gh("GET", f"/issues?labels={LABEL}&state=all&per_page=100")
    r.raise_for_status()
    return len(r.json())


def open_review_issue(batch: int, total: int, threshold: int) -> None:
    _gh("POST", "/labels", json={"name": LABEL, "color": "1D76DB"})  # 422 if exists — fine
    body = (
        f"The feedback flywheel has collected **{total}** records "
        f"(threshold: {threshold} per batch).\n\n"
        f"**Review checklist**\n"
        f"- [ ] Open the [feedback collection]"
        f"(https://console.firebase.google.com/project/{PROJECT_ID}/firestore/databases/-default-/data/~2Ffeedback)\n"
        f"- [ ] For each record: is the user's claim credible? "
        f"Danger-downgrades (claim `actually_harmless` on a DANGEROUS verdict) need the strongest evidence.\n"
        f"- [ ] Mark accepted records `verified: true` in the console\n"
        f"- [ ] Close this issue when the batch is reviewed\n\n"
        f"_Opened automatically by the feedback-trigger workflow._"
    )
    r = _gh(
        "POST",
        "/issues",
        json={"title": f"Feedback review batch {batch} — {total} records collected",
              "body": body, "labels": [LABEL]},
    )
    r.raise_for_status()
    print(f"opened issue: {r.json()['html_url']}")


def main() -> int:
    threshold = int(os.environ.get("FEEDBACK_THRESHOLD", "5"))
    total = firestore_feedback_count()
    batches = announced_batches()
    print(f"feedback total={total} · announced batches={batches} · threshold={threshold}")
    if total >= (batches + 1) * threshold:
        open_review_issue(batches + 1, total, threshold)
    else:
        print(f"next issue at {(batches + 1) * threshold} records — nothing to do")
    return 0


if __name__ == "__main__":
    sys.exit(main())
