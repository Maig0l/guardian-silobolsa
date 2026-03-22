FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Lockfile desde la raíz del monorepo, package.json del frontend
COPY pnpm-lock.yaml ./
COPY frontend/package.json ./package.json
COPY frontend/vite.config.js ./

RUN pnpm install --no-frozen-lockfile

# Código fuente del frontend
COPY frontend/src ./src
COPY frontend/index.html ./index.html

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
