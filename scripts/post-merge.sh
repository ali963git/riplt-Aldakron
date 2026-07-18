#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Build bcrypt native binding (blocked by pnpm's default script approval policy)
BCRYPT_DIR="node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt"
if [ -d "$BCRYPT_DIR" ] && [ ! -f "$BCRYPT_DIR/lib/binding/napi-v3/bcrypt_lib.node" ]; then
  echo "Building bcrypt native binding..."
  (cd "$BCRYPT_DIR" && npm run install)
fi

# Apply any new Prisma migrations
pnpm --filter @workspace/api-server exec prisma migrate deploy
