#!/bin/bash
set -e

export TMP=/app/.tmp
# We set max old space size to a very small number because parcel uses multiple processes
export NODE_OPTIONS="--max-old-space-size=200"

echo "Wait for first build..."
parcel watch --no-autoinstall --hmr-port 12345 --hmr-hostname $PROJECT_DOMAIN.glitch.me/__hmr \
  src/frontend/index.html
