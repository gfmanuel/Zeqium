#!/bin/bash
# build-police-web.sh — ejecutar desde la raíz del repo en tu máquina local
# Uso: ./build-police-web.sh

set -e

FRONTEND="$(pwd)/frontend/police-web"
BUNDLE="$(pwd)/bundle-police"

echo "==> Build local (standalone)..."
cd "$FRONTEND"
npm run build
cd -

echo "==> Preparando bundle local..."
rm -rf "$BUNDLE"
mkdir -p "$BUNDLE"
cp -r "$FRONTEND/.next/standalone/." "$BUNDLE/"
mkdir -p "$BUNDLE/.next"
cp -r "$FRONTEND/.next/static" "$BUNDLE/.next/static"
[ -d "$FRONTEND/public" ] && cp -r "$FRONTEND/public" "$BUNDLE/public"

echo "==> ✅ Listo."
echo "Bundle preparado en: $BUNDLE"
echo "Puedes probarlo ejecutando: cd $BUNDLE && node server.js"