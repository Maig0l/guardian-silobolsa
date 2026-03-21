# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json mikro-orm.config.ts ./
COPY src ./src

RUN pnpm build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Copia artefactos compilados y config de ORM
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/mikro-orm.config.ts ./mikro-orm.config.ts

EXPOSE 3000

CMD ["node", "dist/server.js"]
