#!/bin/bash

set -e
# Add node_modules/.bin to PATH
export PATH="$(pwd)/node_modules/.bin:$(pwd)/../../node_modules/.bin:$PATH"

rimraf out
npm run build

# Copy build output directly to out directory
cp -r dist out

node scripts/after-bundle.js
