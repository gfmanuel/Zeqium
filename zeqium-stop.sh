#!/bin/bash

# Colores para la consola
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${YELLOW}🛑 DETENIENDO SISTEMA ZEQIUM (Preservando datos)${NC}"
echo -e "${BLUE}=================================================${NC}"

# 1. Detener servicios Off-Chain (APIs, Nginx, DBs)
echo -e "\n1. Deteniendo servicios del Backend..."
if [ -f "backend/docker-compose-offchain.yaml" ]; then
    docker compose -f backend/docker-compose-offchain.yaml stop
else
    echo "⚠️  No se encontró docker-compose-offchain.yaml en backend/"
fi

# 2. Detener red Blockchain (Peers, Orderers)
echo -e "2. Deteniendo nodos de la red Fabric..."
if [ -f "blockchain/network/docker-compose.yaml" ]; then
    docker compose -f blockchain/network/docker-compose.yaml stop
else
    echo "⚠️  No se encontró docker-compose.yaml en blockchain/network/"
fi

echo -e "\n${BLUE}=================================================${NC}"
echo -e "${YELLOW}✅ Zeqium se ha detenido correctamente.${NC}"
echo -e "Puedes volver a arrancar con: ${BLUE}docker compose start${NC}"
echo -e "${BLUE}=================================================${NC}"
