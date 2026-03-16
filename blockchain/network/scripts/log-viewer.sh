#!/bin/bash
# Muestra logs de los 3 componentes clave en tiempo real
docker logs -f peer0.policia.zeqium.com & 
docker logs -f orderer0.zeqium.com & 
docker logs -f police-api
