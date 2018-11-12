#!/bin/bash
set -e

export TMP=/app/.tmp
export NODE_OPTIONS="--max-old-space-size=256"

echo "Building..."
parcel watch --no-autoinstall --hmr-port 12345 --hmr-hostname $PROJECT_DOMAIN.glitch.me/__hmr \
  src/frontend/index.html
