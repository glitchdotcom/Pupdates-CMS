#!/bin/bash

rm -rf dist/*
while [ ! -f dist/index.html ]; do
  sleep 0.5
done

node src/backend/server.js
