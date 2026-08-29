#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

FILES=(manifest.json background.js content.js content.css options.html options.js)

rm -rf dist
mkdir -p dist
zip -q dist/prefix-search.zip "${FILES[@]}"
echo "Packaged: dist/prefix-search.zip"
