#!/bin/sh

# Before starting the server, we need to run any prisma migrations that haven't yet been applied.

set -ex
npx prisma migrate deploy
npm run start
