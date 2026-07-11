"""Targeted per-species iNaturalist pull to raise precision on the hard-case misses.

The v2 hard-case misses are all big-four venomous snakes; the look-alikes (rat/wolf snake) are the
confusers. This pulls many more images of *specifically* those species into data/raw/inat_targeted/,
skipping observations already in the iNat set or already pulled here. Resilient: retries with backoff,
incremental manifest, and resume on re-run. Rebuild the dataset (nb-03 logic) + re-fine-tune to benefit.

    python scripts/pull_targeted_species.py
"""
from __future__ import annotations

import csv
import time
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "data" / "raw" / "inat_targeted"
MANIFEST = ROOT / "data" / "manifests" / "inat_targeted_manifest.csv"
EXISTING_MANIFEST = ROOT / "data" / "manifests" / "inaturalist_manifest.csv"

INAT = "https://api.inaturalist.org/v1"
UA = "Faunari-targeted-pull/0.1 (research)"
TIMEOUT = 30
PER_PAGE = 200
MAX_PER_SPECIES = 250
FIELDS = ["source", "record_id", "scientific_name", "venom_label", "license",
          "image_url", "local_path", "captured_at"]

TARGETS = {
    "Naja naja": "venomous", "Naja kaouthia": "venomous", "Ophiophagus hannah": "venomous",
    "Bungarus caeruleus": "venomous", "Bungarus fasciatus": "venomous",
    "Daboia russelii": "venomous", "Echis carinatus": "venomous", "Hypnale hypnale": "venomous",
    "Ptyas mucosa": "non_venomous", "Lycodon aulicus": "non_venomous",
    "Lycodon travancoricus": "non_venomous", "Coelognathus helena": "non_venomous",
}


def _get(url: str, params: dict, tries: int = 5) -> dict:
    """GET JSON with retry + backoff (iNat API occasionally times out)."""
    for i in range(tries):
        try:
            r = requests.get(url, params=params, headers={"User-Agent": UA}, timeout=TIMEOUT)
            r.raise_for_status()
            return r.json()
        except Exception:  # noqa: BLE001 - retry transient failures
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))
    return {}


def taxon_id(name: str) -> int | None:
    for res in _get(f"{INAT}/taxa", {"q": name}).get("results", []):
        if res.get("name") == name:
            return res["id"]
    return None


def load_done() -> set[str]:
    """Observation ids already in the main iNat set or already pulled here (resume + de-dup)."""
    done: set[str] = set()
    for m in (EXISTING_MANIFEST, MANIFEST):
        if m.exists():
            done |= set(pd.read_csv(m)["record_id"].astype(str))
    return done


def download(url: str, dest: Path, tries: int = 3) -> bool:
    for i in range(tries):
        try:
            with requests.get(url, stream=True, timeout=TIMEOUT, headers={"User-Agent": UA}) as r:
                r.raise_for_status()
                dest.parent.mkdir(parents=True, exist_ok=True)
                with dest.open("wb") as fh:
                    for part in r.iter_content(1 << 16):
                        fh.write(part)
            return True
        except Exception:  # noqa: BLE001
            if i == tries - 1:
                return False
            time.sleep(1 + i)
    return False


def main() -> None:
    pid = _get(f"{INAT}/places/autocomplete", {"q": "India"})["results"][0]["id"]
    done = load_done()
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    new_file = not MANIFEST.exists()
    with MANIFEST.open("a", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        if new_file:
            writer.writeheader()
        for name, label in TARGETS.items():
            try:
                tid = taxon_id(name)
                if tid is None:
                    print(f"[!] no taxon id for {name}")
                    continue
                got, page = 0, 1
                while got < MAX_PER_SPECIES:
                    results = _get(f"{INAT}/observations",
                                   {"taxon_id": tid, "place_id": pid, "quality_grade": "research",
                                    "photos": "true", "per_page": PER_PAGE, "page": page}).get("results", [])
                    if not results:
                        break
                    for obs in results:
                        rid = str(obs.get("id"))
                        if rid in done:
                            continue
                        photos = obs.get("photos") or []
                        if not photos:
                            continue
                        img = (photos[0].get("url") or "").replace("square", "medium")
                        local = DEST / name.replace(" ", "_") / f"{rid}.jpg"
                        if img and download(img, local):
                            writer.writerow({"source": "inat_targeted", "record_id": rid,
                                             "scientific_name": name, "venom_label": label,
                                             "license": photos[0].get("license_code"), "image_url": img,
                                             "local_path": str(local), "captured_at": obs.get("observed_on")})
                            fh.flush()
                            done.add(rid)
                            got += 1
                            if got >= MAX_PER_SPECIES:
                                break
                    page += 1
                    time.sleep(0.5)
                print(f"{name:24s} (+{label[:3]}): {got} new images")
            except Exception as exc:  # noqa: BLE001 - one species failing must not kill the rest
                print(f"[!] {name} failed: {type(exc).__name__}: {exc}")
    total = sum(1 for _ in DEST.rglob("*.jpg")) if DEST.exists() else 0
    print(f"\nDONE: {total} images on disk -> {DEST}  (manifest: {MANIFEST.name})")


if __name__ == "__main__":
    main()
