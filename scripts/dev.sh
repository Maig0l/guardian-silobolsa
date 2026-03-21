#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Levanta el stack completo de desarrollo
#   • Servicios de infra (MariaDB + Mosquitto) via Docker
#   • Backend y Frontend en modo watch en procesos locales
# ─────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Colores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🛡️  Guardián Silobolsa — Dev${NC}"
echo "──────────────────────────────────────"

# 1. Verificar que existe .env
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  No se encontró .env — copiando desde .env.example${NC}"
  cp .env.example .env
  echo -e "${YELLOW}   Completá los valores en .env antes de continuar${NC}"
fi

# 2. Levantar infra con Docker
echo -e "\n${GREEN}🐳  Levantando MariaDB y Mosquitto...${NC}"
docker compose up -d mariadb mosquitto

# Esperar a que MariaDB esté lista
echo -e "${GREEN}⏳  Esperando a que MariaDB esté lista...${NC}"
until docker exec guardian_mariadb healthcheck.sh --connect --innodb_initialized 2>/dev/null; do
  sleep 2
done
echo -e "${GREEN}✅  MariaDB lista${NC}"

# 3. Instalar dependencias si hace falta
if [ ! -d "node_modules" ]; then
  echo -e "\n${GREEN}📦  Instalando dependencias del monorepo...${NC}"
  pnpm install
fi

# 4. Levantar backend y frontend en paralelo
echo -e "\n${GREEN}🚀  Iniciando backend y frontend...${NC}"
echo "──────────────────────────────────────"
pnpm dev
