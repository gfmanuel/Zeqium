FROM node:18-alpine

WORKDIR /usr/src/app

# Copiamos la carpeta shared y la instalamos
COPY shared ./shared
RUN cd shared && npm install

# Copiamos la API de la policía y la instalamos
COPY police-api/package*.json ./police-api/
RUN cd police-api && npm install

# Copiamos el resto del código de la policía
COPY police-api ./police-api

# Nos movemos a la carpeta de la API para arrancar
WORKDIR /usr/src/app/police-api

CMD ["npm", "start"]