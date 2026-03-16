#!/bin/bash

# Colores para la consola
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️  INICIANDO LIMPIEZA TOTAL DE ZEQIUM ⚠️${NC}"
echo -e "${YELLOW}Este proceso borrará bases de datos, identidades y el ledger de la blockchain.${NC}"

# 1. Detener y eliminar todos los contenedores del proyecto
echo -e "\n1. Deteniendo contenedores de APIs y Red..."
# Intentamos usar los compose si existen, si no, forzamos por nombre
docker compose -f backend/docker-compose-offchain.yaml down -v 2>/dev/null
cd blockchain/network && docker compose down -v 2>/dev/null && cd ../../

# 2. Limpieza agresiva de Docker (Contenedores huérfanos y Chaincodes)
echo "2. Eliminando residuos de Docker (Chaincodes y Volúmenes)..."
docker rm -f $(docker ps -aq --filter name=zeqium) 2>/dev/null
docker rm -f $(docker ps -aq --filter name=dev-peer) 2>/dev/null
docker volume rm $(docker volume ls -q --filter name=zeqium) 2>/dev/null

# 3. Borrar imágenes de Chaincode generadas por Fabric
echo "3. Limpiando imágenes de Chaincode..."
docker rmi $(docker images -q --filter reference='dev-peer*') 2>/dev/null

# 4. Borrar artefactos de la Blockchain (Criptografía y Bloques)
echo "4. Eliminando certificados y transacciones de canal..."
# Usamos sudo aquí porque Docker a veces cambia los permisos de la carpeta crypto a root
sudo rm -rf blockchain/network/crypto-config/
sudo rm -rf blockchain/network/channel-artifacts/*.block
sudo rm -rf blockchain/network/channel-artifacts/*.tx
rm -f blockchain/network/*.tar.gz

# 5. Limpiar identidades y logs de los Backends
echo "5. Limpiando caché y carpetas temporales de las APIs..."
rm -rf backend/hotel-api/wallet/
rm -rf backend/police-api/wallet/
rm -f backend/*.log

echo -e "\n${RED}✨ Sistema Zeqium totalmente reseteado.${NC}"
