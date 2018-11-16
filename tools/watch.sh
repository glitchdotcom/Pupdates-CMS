#!/bin/bash
set -e

export TMP=/app/.tmp
# We set max old space size to a very small number because parcel uses multiple processes
export NODE_OPTIONS="--max-old-space-size=256"

# apply patches
cp /app/.patches/cpuCount.js /app/node_modules/parcel-bundler/lib/utils/cpuCount.js
cp /app/.patches/cpuCount.js /app/node_modules/parcel-bundler/src/utils/cpuCount.js

while true; do
echo "Wait for first build..."
  parcel watch --hmr-port 12345 --hmr-hostname $PROJECT_DOMAIN.glitch.me/__hmr \
    src/frontend/index.html
  echo "parcel watch crashed"
  sleep 1
done
