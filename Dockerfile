FROM node:18-bullseye-slim as base

ENV NODE_ENV="production"

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install dependencies & build
FROM base as build

WORKDIR /remix-app

ADD package.json package-lock.json .npmrc ./

# To build the app we need some of the dev dependencies as well
RUN npm install --production=false

# Create the prisma client
ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Remove dev dependencies after finishing build to keep the image size down
RUN npm prune --production

FROM base

# Add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /remix-app

COPY --from=build /remix-app/node_modules ./node_modules
COPY --from=build /remix-app/build ./build
COPY --from=build /remix-app/public ./public
COPY --from=build /remix-app/prisma ./prisma
COPY --from=build /remix-app/package.json ./package.json
COPY --from=build /remix-app/start.sh ./start.sh

ENTRYPOINT ["./start.sh"]
