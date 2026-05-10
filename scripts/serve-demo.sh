#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8080}"

cd "$(dirname "$0")/.."

if command -v python3 >/dev/null 2>&1; then
  echo "Serving Faultline demo at http://localhost:${PORT}/demo.html"
  python3 -m http.server "${PORT}"
else
  echo "python3 is required to serve the static demo."
  exit 1
fi
