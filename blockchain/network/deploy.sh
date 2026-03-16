#!/bin/bash
# ================================================
# ZEQIUM - START BLOCKCHAIN HA (Ejecución dentro de CLI)
# ================================================
set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}⚙️ Enviando comandos de despliegue al contenedor CLI...${NC}"

# Ejecutamos todo el bloque dentro del contenedor 'cli'
docker exec cli bash -c '
set -e
CHANNEL_NAME="zeqium-channel"
CC_NAME="zeqium"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CC_LABEL="${CC_NAME}_${CC_VERSION}"
ORDERER_CA="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/zeqium.com/orderers/orderer0.zeqium.com/msp/tlscacerts/tlsca.zeqium.com-cert.pem"

echo "=== 1. Creando canal ==="
export CORE_PEER_LOCALMSPID="PoliciaMSP"
export CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/users/Admin@policia.zeqium.com/msp"
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer0.policia.zeqium.com/tls/ca.crt"
export CORE_PEER_ADDRESS=peer0.policia.zeqium.com:7051

peer channel create -o orderer0.zeqium.com:7050 --ordererTLSHostnameOverride orderer0.zeqium.com -c $CHANNEL_NAME -f ./channel-artifacts/zeqium-channel.tx --outputBlock ./channel-artifacts/zeqium-channel.block --tls --cafile $ORDERER_CA

echo "=== 2. Uniendo nodos de Policia ==="
peer channel join -b ./channel-artifacts/zeqium-channel.block

export CORE_PEER_ADDRESS=peer1.policia.zeqium.com:7053
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer1.policia.zeqium.com/tls/ca.crt"
peer channel join -b ./channel-artifacts/zeqium-channel.block

echo "=== 3. Uniendo nodos de Hotel ==="
export CORE_PEER_LOCALMSPID="HotelMSP"
export CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/users/Admin@hotel.zeqium.com/msp"

export CORE_PEER_ADDRESS=peer0.hotel.zeqium.com:9051
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/peers/peer0.hotel.zeqium.com/tls/ca.crt"
peer channel join -b ./channel-artifacts/zeqium-channel.block

export CORE_PEER_ADDRESS=peer1.hotel.zeqium.com:9053
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/peers/peer1.hotel.zeqium.com/tls/ca.crt"
peer channel join -b ./channel-artifacts/zeqium-channel.block

echo "=== 4. Empaquetando Chaincode ==="
peer lifecycle chaincode package zeqium.tar.gz --path /opt/gopath/src/github.com/chaincode/ --lang golang --label $CC_LABEL

echo "=== 5. Instalando Chaincode ==="
peer lifecycle chaincode install zeqium.tar.gz

export CORE_PEER_ADDRESS=peer0.hotel.zeqium.com:9051
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/peers/peer0.hotel.zeqium.com/tls/ca.crt"
peer lifecycle chaincode install zeqium.tar.gz

export CORE_PEER_LOCALMSPID="PoliciaMSP"
export CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/users/Admin@policia.zeqium.com/msp"
export CORE_PEER_ADDRESS=peer0.policia.zeqium.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer0.policia.zeqium.com/tls/ca.crt"
peer lifecycle chaincode install zeqium.tar.gz

export CORE_PEER_ADDRESS=peer1.policia.zeqium.com:7053
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer1.policia.zeqium.com/tls/ca.crt"
peer lifecycle chaincode install zeqium.tar.gz

echo "=== 6. Obteniendo Package ID ==="
CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep $CC_LABEL | awk "{print \$3}" | sed "s/,//")

echo "=== 7. Aprobando (Policia) ==="
export CORE_PEER_ADDRESS=peer0.policia.zeqium.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer0.policia.zeqium.com/tls/ca.crt"
peer lifecycle chaincode approveformyorg -o orderer0.zeqium.com:7050 --ordererTLSHostnameOverride orderer0.zeqium.com --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA

echo "=== 8. Aprobando (Hotel) ==="
export CORE_PEER_LOCALMSPID="HotelMSP"
export CORE_PEER_MSPCONFIGPATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/users/Admin@hotel.zeqium.com/msp"
export CORE_PEER_ADDRESS=peer0.hotel.zeqium.com:9051
export CORE_PEER_TLS_ROOTCERT_FILE="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/peers/peer0.hotel.zeqium.com/tls/ca.crt"
peer lifecycle chaincode approveformyorg -o orderer0.zeqium.com:7050 --ordererTLSHostnameOverride orderer0.zeqium.com --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA

echo "=== 9. Commit en la red ==="
peer lifecycle chaincode commit -o orderer0.zeqium.com:7050 --ordererTLSHostnameOverride orderer0.zeqium.com --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA --peerAddresses peer0.policia.zeqium.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/policia.zeqium.com/peers/peer0.policia.zeqium.com/tls/ca.crt --peerAddresses peer0.hotel.zeqium.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hotel.zeqium.com/peers/peer0.hotel.zeqium.com/tls/ca.crt
'

echo -e "${GREEN}✅ Blockchain HA desplegada correctamente!${NC}"
