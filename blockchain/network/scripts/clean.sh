#!/bin/bash
echo "🧹 Limpiando entorno Zeqium..."
docker-compose down -v
docker rm -f $(docker ps -aq) 2>/dev/null
docker rmi -f $(docker images | grep "dev-peer" | awk '{print $3}') 2>/dev/null
rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config/
rm -f *.tar.gz
echo "✅ Entorno limpio."
