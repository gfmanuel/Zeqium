FROM node:18-alpine

WORKDIR /usr/src/app

# Copiamos la carpeta shared y la instalamos
COPY shared ./shared
RUN cd shared && npm install

# Copiamos la API del hotel y la instalamos
COPY hotel-api/package*.json ./hotel-api/
RUN cd hotel-api && npm install

# Copiamos el resto del código del hotel
COPY hotel-api ./hotel-api

# Nos movemos a la carpeta de la API para arrancar
WORKDIR /usr/src/app/hotel-api

CMD ["npm", "start"]