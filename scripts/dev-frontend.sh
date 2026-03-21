#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev-frontend.sh — Levanta solo el frontend (asume el backend ya corre)
# ─────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🛡️  Guardián Silobolsa — Frontend${NC}"
echo "──────────────────────────────────────"

# Verificar si el backend está escuchando
BACKEND_PORT="${PORT:-3000}"
if ! curl -sf "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  El backend no parece estar corriendo en el puerto ${BACKEND_PORT}${NC}"
  echo -e "${YELLOW}   Podés levantarlo con: ./scripts/dev-backend.sh${NC}"
  echo ""
fi

# Instalar dependencias del frontend si hace falta
if [ ! -d "frontend/node_modules" ]; then
  echo -e "${GREEN}📦  Instalando dependencias del frontend...${NC}"
  pnpm --filter frontend install
fi

echo -e "${GREEN}🚀  Iniciando frontend en modo watch...${NC}"
echo "──────────────────────────────────────"
pnpm dev:frontend
