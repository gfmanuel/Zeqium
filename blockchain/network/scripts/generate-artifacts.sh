#!/bin/bash
echo "🏗 Generando certificados y bloque génesis..."
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"
mkdir -p channel-artifacts
configtxgen -profile ZeqiumOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
echo "✅ Artefactos listos."
