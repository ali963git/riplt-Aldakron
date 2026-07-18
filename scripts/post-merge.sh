#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Apply any new Prisma migrations
pnpm --filter @workspace/api-server exec prisma migrate deploy
