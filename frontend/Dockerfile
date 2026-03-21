FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY vite.config.js ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start the development server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
