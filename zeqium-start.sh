#!/bin/bash

# Colores para la consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}🚀 RE-ACTIVANDO SISTEMA ZEQIUM (Desde pausa)${NC}"
echo -e "${BLUE}=================================================${NC}"

# 1. Arrancar red Blockchain
echo -e "1. Levantando nodos de Fabric..."
docker compose -f blockchain/network/docker-compose.yaml start

# 2. Arrancar servicios Off-Chain
echo -e "2. Levantando servicios del Backend..."
docker compose -f backend/docker-compose-offchain.yaml start

echo -e "\n${GREEN}⏳ Esperando 5 segundos a que los servicios se sincronicen...${NC}"
sleep 5

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✅ Zeqium vuelve a estar ONLINE${NC}"
echo -e "Tus datos y DIDs registrados se han mantenido intactos."
echo -e "${BLUE}=================================================${NC}"
