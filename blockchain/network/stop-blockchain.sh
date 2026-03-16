#!/bin/bash
echo "🛑 Apagando servicios de Zeqium..."
docker-compose stop
echo "✅ Nodos detenidos (datos preservados en volúmenes)."
