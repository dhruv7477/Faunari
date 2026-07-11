"""Faunari — Streamlit prototype UI (thin): photograph a snake -> conservative danger verdict.

Run from the project root:  streamlit run src/app/streamlit_app.py
All logic lives in the sibling packages; this file only renders the BRD safety UX.
"""
from __future__ import annotations

import streamlit as st
from PIL import Image

from pipeline import FaunariScreener
from safety import content
from schemas import DangerLevel, ScreenResult, Verdict

st.set_page_config(page_title="Faunari — Spot it. Know it. Stay safe.", page_icon="🐍", layout="centered")


@st.cache_resource(show_spinner="Loading the BioCLIP screener (first run only)…")
def load_screener() -> FaunariScreener:
    """Build the screening pipeline once per session (loads the BioCLIP backbone + artifacts)."""
    return FaunariScreener.from_artifacts()


def render_emergency() -> None:
    """Always-reachable emergency panel — a bite is always an emergency (BRD §10.1)."""
    with st.expander("🚑 Was someone bitten? — tap for emergency first-aid", expanded=False):
        st.error(f"**{content.EMERGENCY['headline']}**")
        for step in content.EMERGENCY["steps"]:
            st.markdown(f"- {step}")


def render_verdict(verdict: Verdict) -> None:
    """Verdict-first banner: icon + word + colour (colour is never the only signal)."""
    banner = f"{verdict.icon}  **{verdict.headline}**\n\n{verdict.subtext}"
    if verdict.level is DangerLevel.LOW_RISK:
        st.success(banner)
    elif verdict.level is DangerLevel.DANGEROUS:
        st.error(banner)
    else:  # CAUTION or UNIDENTIFIED
        st.warning(banner)


def _first_aid_columns() -> None:
    """Render the DO / DON'T snakebite first-aid in two columns."""
    col_do, col_dont = st.columns(2)
    with col_do:
        st.markdown("**DO**")
        for item in content.DANGEROUS_FIRST_AID["do"]:
            st.markdown(f"- {item}")
    with col_dont:
        st.markdown("**DON'T**")
        for item in content.DANGEROUS_FIRST_AID["dont"]:
            st.markdown(f"- {item}")


def render_actions(verdict: Verdict) -> None:
    """Band-appropriate guidance: 'what to do now' (dangerous), 'if bitten' (caution), distance (low)."""
    if verdict.level is DangerLevel.UNIDENTIFIED:
        st.info("📷 Re-shoot the snake from a safe distance (zoom, don't approach). "
                "If anyone was bitten, open the emergency panel above immediately.")
    elif verdict.level is DangerLevel.DANGEROUS:
        st.subheader("🩹 What to do now")
        st.error(f"**{content.EMERGENCY['headline']}** — call 102 / 108.")
        _first_aid_columns()
    elif verdict.level is DangerLevel.CAUTION:
        st.subheader("🩹 If bitten")
        st.warning("Treat any snakebite as an emergency — get medical care immediately (102 / 108).")
        _first_aid_columns()
    else:  # LOW_RISK
        st.info(f"ℹ️ {content.LOW_RISK_NOTE}")


def render_confidence(result: ScreenResult) -> None:
    """Plain-language confidence anchored to the everyday 50% intuition (no technical cut-off jargon)."""
    if result.prediction is None:
        st.caption("Faunari couldn't confirm an in-scope snake in this photo, so it isn't guessing.")
        return

    pct = round(result.verdict.venom_probability * 100)
    if result.verdict.level is DangerLevel.DANGEROUS:
        st.caption(f"Faunari estimates a **high (~{pct}%)** chance this is venomous.")
    elif result.verdict.level is DangerLevel.CAUTION:
        st.caption(f"Faunari estimates **~{pct}%** chance of venom — not a confident match, "
                   "but not low enough to rule out. Treat it with caution.")
    else:  # LOW_RISK
        st.caption(f"Faunari estimates a **low (~{pct}%)** chance of venom — but never treat any snake as safe.")


def main() -> None:
    st.title("🐍 Faunari")
    st.caption("Spot it. Know it. Stay safe. — *prototype*")
    st.warning(content.DISCLAIMER)
    render_emergency()

    st.markdown("### 1. Take or upload a photo")
    st.caption("📏 Shoot from a **safe distance** and zoom in. Never move closer to a snake for a better photo.")
    source = st.radio("Image source", ["Upload", "Camera"], horizontal=True, label_visibility="collapsed")
    image_file = st.camera_input("Camera") if source == "Camera" else st.file_uploader(
        "Upload a snake photo", type=["jpg", "jpeg", "png"])

    if image_file is None:
        st.stop()

    try:
        image = Image.open(image_file)
    except Exception:  # noqa: BLE001 - malformed upload
        st.error("Could not read that image. Please try another photo.")
        st.stop()

    st.image(image, caption="Your photo", use_container_width=True)

    with st.spinner("Analysing…"):
        result = load_screener().screen(image)

    st.markdown("### 2. Result")
    render_verdict(result.verdict)
    render_actions(result.verdict)
    render_confidence(result)

    with st.expander("How this works & limitations"):
        st.markdown(
            "- Binary **venomous vs non-venomous** model (frozen BioCLIP features + calibrated head).\n"
            "- An **OOD gate** rejects 'not-a-snake' / unclear images instead of guessing (FR-02).\n"
            "- Tuned for **high recall on venomous** — it intentionally **over-warns** rather than miss danger.\n"
            "- **Prototype limits:** first-aid text is not clinician-reviewed; trained mainly on Indian "
            "snakes; the OOD threshold is a heuristic. It can be wrong — when unsure it assumes danger."
        )


if __name__ == "__main__":
    main()
