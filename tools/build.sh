#!/bin/bash

# production: small bundle, no React webtools
# development: larger bundle, source maps
export NODE_ENV=development

build() {
  rm -rf dist/
  if [[ $NODE_ENV == "production" ]]; then
    parcel build --no-autoinstall src/frontend/index.html
  else
    parcel build --no-minify --no-autoinstall src/frontend/index.html
  fi
}

echo "Building... "
build &> /tmp/build.out
if [ $? -ne 0 ]; then
  cat /tmp/build.out
else
  echo "done!"
fi
rm /tmp/build.out
