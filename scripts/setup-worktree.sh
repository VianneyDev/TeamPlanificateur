#!/bin/sh
# Copie le .env du repo principal dans le worktree fraîchement créé.
# treehouse exécute ce hook dans le répertoire du worktree.

MAIN_REPO="$HOME/dev/TeamPlanificateur"

if [ -f "$MAIN_REPO/apps/web/.env" ] && [ ! -f "apps/web/.env" ]; then
  cp "$MAIN_REPO/apps/web/.env" "apps/web/.env"
  echo "Copied apps/web/.env from main repo"
fi

if [ -f "$MAIN_REPO/apps/web/.env.test" ] && [ ! -f "apps/web/.env.test" ]; then
  cp "$MAIN_REPO/apps/web/.env.test" "apps/web/.env.test"
  echo "Copied apps/web/.env.test from main repo"
fi

# Optionnel : installer les deps si besoin (décommente si tu veux)
# if [ -f "pnpm-lock.yaml" ]; then
#   pnpm install
# fi
