#!/bin/bash
echo "🧹 Limpiando bases de datos y caché off-chain..."
docker compose -f docker-compose-offchain.yaml down -v
echo "✅ Servicios off-chain eliminados."
