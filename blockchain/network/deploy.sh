#!/bin/bash
export PATH=${PWD}/../bin:$PATH

# Script de inicialización de Zeqium con TLS

CHANNEL_NAME="zeqium-channel"
CC_NAME="zeqium"
CC_SRC_PATH="../chaincode"
CC_VERSION="1.0"
CC_SEQUENCE="1"

export FABRIC_CFG_PATH=${PWD}
export ORDERER_ADDRESS="orderer.zeqium.com:7050"
export ORDERER_CA="${PWD}/crypto-config/ordererOrganizations/zeqium.com/orderers/orderer.zeqium.com/msp/tlscacerts/tlsca.zeqium.com-cert.pem"

# Policía
export POLICIA_MSP="PoliciaMSP"
export POLICIA_MSP_DIR="${PWD}/crypto-config/peerOrganizations/policia.zeqium.com/users/Admin@policia.zeqium.com/msp"
export POLICIA_ADDRESS="peer0.policia.zeqium.com:7051"
export POLICIA_TLS_CA="${PWD}/crypto-config/peerOrganizations/policia.zeqium.com/peers/peer0.policia.zeqium.com/tls/ca.crt"

# Hotel
export HOTEL_MSP="HotelMSP"
export HOTEL_MSP_DIR="${PWD}/crypto-config/peerOrganizations/hotel.zeqium.com/users/Admin@hotel.zeqium.com/msp"
export HOTEL_ADDRESS="peer0.hotel.zeqium.com:9051"
export HOTEL_TLS_CA="${PWD}/crypto-config/peerOrganizations/hotel.zeqium.com/peers/peer0.hotel.zeqium.com/tls/ca.crt"

echo "=== 1. Generando transacción del canal ==="
configtxgen -profile ZeqiumChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID ${CHANNEL_NAME}

echo "=== 2. Creando el canal ==="
export CORE_PEER_LOCALMSPID=$POLICIA_MSP
export CORE_PEER_MSPCONFIGPATH=$POLICIA_MSP_DIR
export CORE_PEER_ADDRESS=$POLICIA_ADDRESS
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICIA_TLS_CA
peer channel create -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block --tls --cafile $ORDERER_CA

echo "=== 3. Uniendo a la Policía al canal ==="
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block

echo "=== 4. Uniendo al Hotel al canal ==="
export CORE_PEER_LOCALMSPID=$HOTEL_MSP
export CORE_PEER_MSPCONFIGPATH=$HOTEL_MSP_DIR
export CORE_PEER_ADDRESS=$HOTEL_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$HOTEL_TLS_CA
peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block

echo "=== 5. Empaquetando Chaincode ==="
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang golang --label ${CC_NAME}_${CC_VERSION}

echo "=== 6. Instalando Chaincode en Policía ==="
export CORE_PEER_LOCALMSPID=$POLICIA_MSP
export CORE_PEER_MSPCONFIGPATH=$POLICIA_MSP_DIR
export CORE_PEER_ADDRESS=$POLICIA_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICIA_TLS_CA
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "=== 7. Instalando Chaincode en Hotel ==="
export CORE_PEER_LOCALMSPID=$HOTEL_MSP
export CORE_PEER_MSPCONFIGPATH=$HOTEL_MSP_DIR
export CORE_PEER_ADDRESS=$HOTEL_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$HOTEL_TLS_CA
peer lifecycle chaincode install ${CC_NAME}.tar.gz

CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep ${CC_NAME}_${CC_VERSION} | awk '{print $3}' | sed 's/,//')

echo "=== 8. Aprobando Chaincode (Policía) ==="
export CORE_PEER_LOCALMSPID=$POLICIA_MSP
export CORE_PEER_MSPCONFIGPATH=$POLICIA_MSP_DIR
export CORE_PEER_ADDRESS=$POLICIA_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICIA_TLS_CA
peer lifecycle chaincode approveformyorg -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA

echo "=== 9. Aprobando Chaincode (Hotel) ==="
export CORE_PEER_LOCALMSPID=$HOTEL_MSP
export CORE_PEER_MSPCONFIGPATH=$HOTEL_MSP_DIR
export CORE_PEER_ADDRESS=$HOTEL_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$HOTEL_TLS_CA
peer lifecycle chaincode approveformyorg -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $CC_PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA

echo "=== 10. Commit del Chaincode ==="
export CORE_PEER_LOCALMSPID=$POLICIA_MSP
export CORE_PEER_MSPCONFIGPATH=$POLICIA_MSP_DIR
export CORE_PEER_ADDRESS=$POLICIA_ADDRESS
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICIA_TLS_CA
peer lifecycle chaincode commit -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --tls --cafile $ORDERER_CA --peerAddresses $POLICIA_ADDRESS --tlsRootCertFiles $POLICIA_TLS_CA --peerAddresses $HOTEL_ADDRESS --tlsRootCertFiles $HOTEL_TLS_CA

echo "✅ Red Zeqium desplegada y lista."
