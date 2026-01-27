FROM node:20-bookworm-slim AS build

WORKDIR /app/apps/backend

COPY apps/backend/package.json apps/backend/package-lock.json ./
RUN npm ci

COPY apps/backend/ ./
RUN npm run build

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/backend

COPY --from=build /app/apps/backend/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=build /app/apps/backend/prisma.config.ts ./prisma.config.ts

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "until pg_isready -h ${DATABASE_HOST:-db} -p ${DATABASE_PORT:-5432} -U ${DATABASE_USER:-postgres}; do sleep 1; done; npx prisma migrate deploy --schema prisma/schema.prisma; node dist/main"]
