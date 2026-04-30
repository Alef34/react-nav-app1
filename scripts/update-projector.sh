#!/bin/bash
# update-projector.sh
# Stiahne najnovsiu verziu z gitu, nainstaluje balicky a prebuilduje aplikaciu.
# Spusti na RPi: bash ~/react-nav-app1/scripts/update-projector.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "=== update-projector: start ==="
echo "App dir: $APP_DIR"
cd "$APP_DIR"

echo ""
echo "[1/4] git pull..."
git pull

echo ""
echo "[2/4] npm install (ak su nove balicky)..."
npm install

echo ""
echo "[3/4] npm run build..."
npm run build

echo ""
echo "[4/4] Kontrola dist/..."
if [ -f "$APP_DIR/dist/index.html" ]; then
  echo "  OK - dist/index.html existuje"
else
  echo "  CHYBA - dist/index.html chyba! Build zlyhal?"
  exit 1
fi

echo ""
echo "=== update-projector: HOTOVO ==="
echo ""
echo "Teraz restartni servery:"
echo "  pkill -f projector-start || true"
echo "  cd $APP_DIR && npm run projector:start &"
echo ""
echo "Alebo ak pouzivas screen/tmux, restartuuj prislusnu session."
