#!/usr/bin/env bash
# Run on the VM from the extracted release directory (~/jisr). Idempotent.
# - builds and (re)starts the jisr compose project (other projects untouched)
# - installs the nginx site for jisr.duckdns.org (HTTP) and reloads nginx only if the config test passes
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f deploy/.env ] || { echo "deploy/.env missing (copy deploy/.env.example and fill it)"; exit 1; }

sudo docker compose -p jisr -f deploy/docker-compose.yml up -d --build

# nginx site (only our own file; never edits other sites). Installed once: after that certbot owns
# the HTTPS edits in it, so redeploys must not overwrite it.
if [ ! -f /etc/nginx/sites-available/jisr ]; then
  sudo cp deploy/nginx/jisr.conf /etc/nginx/sites-available/jisr
fi
sudo ln -sf /etc/nginx/sites-available/jisr /etc/nginx/sites-enabled/jisr
if sudo nginx -t; then
  sudo systemctl reload nginx
else
  echo "nginx config test failed; removing jisr site so other sites keep working"
  sudo rm -f /etc/nginx/sites-enabled/jisr
  exit 1
fi

for i in $(seq 1 30); do
  curl -fsS http://127.0.0.1:8120/healthz >/dev/null && curl -fsS -o /dev/null http://127.0.0.1:3120/en && break
  sleep 2
done
echo "api:  $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8120/healthz)"
echo "web:  $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3120/en)"
echo "via nginx: $(curl -s -o /dev/null -w '%{http_code}' -H 'Host: jisr.duckdns.org' http://127.0.0.1/healthz)"
