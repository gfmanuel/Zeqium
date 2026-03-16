#!/bin/bash

# Colores para la consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}        ZEQIUM - DESPLIEGUE INTEGRAL             ${NC}"
echo -e "${BLUE}=================================================${NC}"

# 1. Desplegar la infraestructura Blockchain (Capa 5)
echo -e "${GREEN}🔗 Paso 1: Iniciando Red Hyperledger Fabric HA...${NC}"
cd blockchain/network
chmod +x start-blockchain.sh
./start-blockchain.sh

if [ $? -ne 0 ]; then
    echo "❌ Error en el despliegue de la Blockchain. Abortando."
    exit 1
fi

# 2. Volver a la raíz y entrar en el Backend (Capas 2, 3 y 4)
echo -e "\n${GREEN}🚀 Paso 2: Iniciando Servicios Off-Chain (APIs + DBs)...${NC}"
cd ../../backend
chmod +x start-backend.sh
./start-backend.sh

if [ $? -ne 0 ]; then
    echo "❌ Error en el despliegue del Backend. Abortando."
    exit 1
fi

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}⭐ ¡SISTEMA ZEQIUM COMPLETAMENTE OPERATIVO!${NC}"
echo -e "Dashboard Hotel: http://localhost/ (vía Gateway)"
echo -e "${BLUE}=================================================${NC}"
