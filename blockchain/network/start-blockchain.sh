#!/bin/bash

# Colores para que los logs sean legibles
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando despliegue completo de Zeqium HA...${NC}"

# Exportar la ruta de los binarios de Fabric (cryptogen, configtxgen, etc.)
export PATH=${PWD}/../bin:$PATH

# 1. Limpieza total
echo -e "${GREEN}🧹 Paso 1: Limpiando contenedores y artefactos previos...${NC}"
docker compose down -v
docker rm -f $(docker ps -aq) 2>/dev/null
docker rmi -f $(docker images | grep "dev-peer" | awk '{print $3}') 2>/dev/null
rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config/
rm -f *.tar.gz

# Dile a la terminal dónde está tu archivo de configuración (configtx.yaml)
export FABRIC_CFG_PATH=${PWD}

# Crea la carpeta donde se guardarán los resultados
mkdir -p channel-artifacts

# 2. Generación de Criptografía (MSP)
echo -e "${GREEN}🔐 Paso 2: Generando certificados (cryptogen)...${NC}"
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

# 3. Generación de los Bloques de la Red
echo -e "${GREEN}🏗 Paso 3: Generando bloque génesis y transacción del canal...${NC}"
# Genera el Bloque Génesis (El bloque cero que levanta el Orderer)
configtxgen -profile ZeqiumGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Genera la Transacción del Canal (El archivo que unirá a la Policía y al Hotel)
configtxgen -profile ZeqiumChannel -outputCreateChannelTx ./channel-artifacts/zeqium-channel.tx -channelID zeqium-channel

# 4. Levantar Red Docker
echo -e "${GREEN}🐳 Paso 4: Levantando nodos (3 Orderers, 4 Peers, CLI)...${NC}"
# Iniciar la infraestructura en segundo plano
docker compose up -d

# 5. Espera de cortesía
# Importante: Raft necesita unos segundos para elegir al líder entre los 3 Orderers
echo -e "${BLUE}⏳ Esperando 15 segundos para la estabilización del consenso Raft...${NC}"
sleep 40

# 6. Ejecutar el despliegue del canal y chaincode
echo -e "${GREEN}⚙️ Paso 5: Ejecutando deploy.sh (Canal + Chaincode)...${NC}"
chmod +x deploy.sh
./deploy.sh

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✅ ZEQIUM ESTÁ ONLINE Y REDUNDANTE${NC}"
echo -e "${BLUE}=================================================${NC}"
