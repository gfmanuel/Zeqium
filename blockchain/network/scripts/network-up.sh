#!/bin/bash
./clean.sh
./generate-artifacts.sh
docker-compose up -d
echo "⏳ Esperando 10 segundos a que el consenso Raft se estabilice..."
sleep 10
./deploy.sh
