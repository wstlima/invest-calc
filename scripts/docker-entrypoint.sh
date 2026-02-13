#!/usr/bin/env sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Starting app..."
exec npm run start
