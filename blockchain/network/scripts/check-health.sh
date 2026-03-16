#!/bin/bash
echo "🔍 Estado de contenedores Zeqium:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo -e "\n🔍 Canales activos en Peer0 Policía:"
docker exec cli peer channel list
