#!/bin/bash

# production: small bundle, no React webtools
# development: larger bundle, source maps
NODE_ENV=development

echo "Building..."
rm -rf dist/
if [[ $NODE_ENV == "production" ]]; then
  parcel build --no-autoinstall src/frontend/index.html
else
  parcel build --no-minify --no-autoinstall src/frontend/index.html
fi
echo "done!"
