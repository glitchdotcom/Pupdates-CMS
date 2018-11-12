#!/bin/bash
set -e

export TMP=/app/.tmp

echo "Building..."
# parcel watch --no-autoinstall --hmr-port 12345 --hmr-hostname $PROJECT_DOMAIN.glitch.me/__hmr \
#   src/frontend/index.html
