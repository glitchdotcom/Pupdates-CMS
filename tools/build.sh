#!/bin/bash

export NODE_ENV=development

parcel build --no-minify --no-autoinstall src/frontend/index.html
