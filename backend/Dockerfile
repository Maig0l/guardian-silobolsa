FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY backend/package.json ./package.json
RUN pnpm install --no-frozen-lockfile

COPY backend/tsconfig.json backend/mikro-orm.config.ts ./
COPY backend/src ./src

EXPOSE 3000

CMD ["pnpm", "dev"]
