#!/bin/bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Levantando Servicios Off-Chain de Zeqium (Backend)...${NC}"

# 1. Asegurar que la red externa de la blockchain existe
if ! docker network ls | grep -q "zeqium-net"; then
  echo -e "${BLUE}🌐 Creando red zeqium-net...${NC}"
  docker network create zeqium-net
fi

# 2. Instalar dependencias (asumiendo que shared está al mismo nivel que las APIs)
echo -e "${GREEN}📦 Instalando dependencias en Shared y APIs...${NC}"
# Subimos un nivel si shared está en /zeqium/shared o lo buscamos en la ruta actual
npm install --prefix ./shared
npm install --prefix ./police-api
npm install --prefix ./hotel-api

# 3. Levantar contenedores usando el archivo del directorio actual
echo -e "${GREEN}🐳 Iniciando Docker Compose (Databases, Redis, APIs, Gateway)...${NC}"
docker compose -f docker-compose-offchain.yaml up -d --build

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✅ SISTEMA OFF-CHAIN LISTO${NC}"
echo -e "Acceso Policía (Nginx): http://localhost/api/police"
echo -e "Acceso Hotel (Nginx):   http://localhost/api/hotel"
echo -e "${BLUE}=================================================${NC}"
