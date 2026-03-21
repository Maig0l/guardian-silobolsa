#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev-backend.sh — Levanta solo el backend (+ infra si no está corriendo)
# ─────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🛡️  Guardián Silobolsa — Backend${NC}"
echo "──────────────────────────────────────"

# Verificar .env
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  No se encontró .env — copiando desde .env.example${NC}"
  cp .env.example .env
fi

# Levantar infra si no está corriendo
MARIADB_RUNNING=$(docker ps --filter "name=guardian_mariadb" --filter "status=running" -q)
if [ -z "$MARIADB_RUNNING" ]; then
  echo -e "${GREEN}🐳  Levantando MariaDB y Mosquitto...${NC}"
  docker compose up -d mariadb mosquitto

  echo -e "${GREEN}⏳  Esperando a que MariaDB esté lista...${NC}"
  until docker exec guardian_mariadb healthcheck.sh --connect --innodb_initialized 2>/dev/null; do
    sleep 2
  done
  echo -e "${GREEN}✅  MariaDB lista${NC}"
else
  echo -e "${GREEN}✅  Infra ya corriendo${NC}"
fi

# Instalar dependencias del backend si hace falta
if [ ! -d "backend/node_modules" ]; then
  echo -e "${GREEN}📦  Instalando dependencias del backend...${NC}"
  pnpm --filter backend install
fi

echo -e "\n${GREEN}🚀  Iniciando backend en modo watch...${NC}"
echo "──────────────────────────────────────"
pnpm dev:backend
