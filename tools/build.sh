#!/bin/bash

rm -rf dist/
if [[ $NODE_ENV == "production" ]]; then
  parcel build --no-autoinstall src/frontend/index.html
else
  export NODE_ENV="development"
  parcel build --no-minify --no-autoinstall src/frontend/index.html
fi
