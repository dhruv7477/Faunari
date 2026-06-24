# Faunari — Streamlit prototype (CPU). BioCLIP weights (~400MB) download from HF on first run.
FROM python:3.11-slim AS runtime

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    STREAMLIT_SERVER_HEADLESS=true \
    FAUNARI_MODELS_DIR=/app/models

# Only what serving needs — data/ (training-only) and notebooks are excluded via .dockerignore.
COPY pyproject.toml ./
COPY src ./src
COPY models ./models

# Editable install keeps PROJECT_ROOT resolving to /app so the model artifacts are found.
RUN pip install --upgrade pip && pip install -e ".[serve]"

EXPOSE 8501
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8501/_stcore/health').read()==b'ok' else 1)" || exit 1

CMD ["streamlit", "run", "src/app/streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]
