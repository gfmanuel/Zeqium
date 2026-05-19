#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}    ZEQIUM - INSTALACIÓN DE DEPENDENCIAS MÓVIL   ${NC}"
echo -e "${BLUE}=================================================${NC}"

echo -e "${GREEN}📦 Instalando herramientas globales...${NC}"
# Instalamos los CLI globales por si el agente intenta usar comandos directos
sudo npm install -g react-native-cli
sudo npm install -g expo-cli

echo -e "\n${GREEN}🚀 Accediendo a la app e instalando dependencias locales...${NC}"
# Entramos en la ruta exacta que me has indicado
cd mobile/wallet-app 

# Limpiamos cachés por si el agente dejó alguna instalación a medias
npm cache clean --force
rm -rf node_modules package-lock.json

# Instalamos todo en limpio
npm install

echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✅ ENTORNO MÓVIL LISTO. Antigravity puede continuar.${NC}"
echo -e "${BLUE}=================================================${NC}"
