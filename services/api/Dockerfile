# Jisr API. Build context: repository root (needs packages/rules, ai/, data/synthetic).
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_LINK_MODE=copy UV_COMPILE_BYTECODE=1
COPY --from=ghcr.io/astral-sh/uv:0.11.21 /uv /usr/local/bin/uv

WORKDIR /srv/jisr/services/api
COPY services/api/pyproject.toml services/api/uv.lock services/api/.python-version ./
RUN uv sync --frozen --no-dev --no-install-project

COPY services/api/app ./app
COPY packages/rules /srv/jisr/packages/rules
COPY ai /srv/jisr/ai
COPY data/synthetic /srv/jisr/data/synthetic

RUN useradd --system --uid 10001 jisr && mkdir -p /data && chown -R jisr /data /srv/jisr
USER jisr
ENV DATABASE_URL=sqlite:////data/jisr.db \
    JOBS_ENABLED=true \
    DEMO_MODE=true
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=4).status == 200 else 1)"
ENV PATH="/srv/jisr/services/api/.venv/bin:$PATH"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
