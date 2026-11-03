FROM python:3.12-slim@sha256:78387bc3881b8273120a12ebe6c1ab22b018ccc2c9adf565ae1ac9b536e184ea

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8005 \
    APP_ENV=production

COPY --chown=user:user requirements.txt requirements.lock ./
RUN pip install --no-cache-dir -r requirements.lock

COPY --chown=user:user . .

RUN mkdir -p /data /app/data && chown -R user:user /app /home/user /data

# CVE-2026-111497: update system Brotli when present (including curl dependencies).
RUN set -eu; \
    if [ "$(dpkg-query -W -f='${db:Status-Status}' libbrotli1 2>/dev/null || true)" = installed ]; then \
        apt-get update; \
        apt-get install -y --no-install-recommends --only-upgrade libbrotli1; \
        dpkg --compare-versions "$(dpkg-query -W -f='${Version}' libbrotli1)" ge '1.1.0-2+deb13u1'; \
        rm -rf /var/lib/apt/lists/*; \
    fi

USER user

EXPOSE 8005
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent --show-error "http://127.0.0.1:${PORT:-8005}/health" > /dev/null || exit 1

CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port \"${PORT:-8005}\""]
