#!/bin/bash

set -e
# Add node_modules/.bin to PATH
export PATH="$(pwd)/node_modules/.bin:$(pwd)/../../node_modules/.bin:$PATH"

rimraf out
npm run build

# Copy build output directly to out directory
cp -r dist out

# Copy @mx-space/compiled package
mkdir -p out/node_modules/@mx-space/compiled
cp -r ../../packages/compiled/dist out/node_modules/@mx-space/compiled/
cp ../../packages/compiled/package.json out/node_modules/@mx-space/compiled/

# Copy package files for dependency installation
cp package.json out/

node scripts/after-bundle.js
