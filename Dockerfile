# syntax=docker/dockerfile:1
# ── Stage 1: Dependencies ────────────────────────────────
FROM node:20-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-audit --no-fund

# ── Stage 2: Build ───────────────────────────────────────
FROM node:20-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client & build Next.js (standalone).
# The .next/cache mount persists the Next.js compiler cache across deploys so
# only changed modules recompile. The cache id MUST be unique per app: the
# control-plane and shop-app are different Next builds, and sharing one
# .next/cache (BuildKit defaults the id to the target path) cross-poisoned
# webpack module/chunk ids between them, surfacing as "TypeError: tB is not a
# function" at build time. Distinct ids keep each app's cache isolated.
RUN npx prisma generate
RUN --mount=type=cache,id=next-cache-control-plane,target=/app/.next/cache \
    NEXT_PRIVATE_MAX_WORKERS=2 npm run build

# ── Stage 3: Runner ──────────────────────────────────────
FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /bin/sh -m nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + generated client + CLI (needed for `prisma migrate deploy`)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
