#!/bin/sh
# Copie le .env du repo principal dans le worktree fraîchement créé.
# treehouse exécute ce hook dans le répertoire du worktree.

MAIN_REPO="$HOME/dev/TeamPlanificateur"

if [ -f "$MAIN_REPO/.env" ] && [ ! -f ".env" ]; then
  cp "$MAIN_REPO/.env" ".env"
  echo "Copied .env from main repo"
fi

if [ -f "$MAIN_REPO/.env.test" ] && [ ! -f ".env.test" ]; then
  cp "$MAIN_REPO/.env.test" ".env.test"
  echo "Copied .env.test from main repo"
fi

# Optionnel : installer les deps si besoin (décommente si tu veux)
# if [ -f "pnpm-lock.yaml" ]; then
#   pnpm install
# fi
