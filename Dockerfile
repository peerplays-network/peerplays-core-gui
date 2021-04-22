FROM node:12-alpine3.12

WORKDIR /peerid-backend

ARG node_env=''
ENV NODE_ENV=$node_env

COPY ./package*.json /peerid-backend
RUN apk update && apk add g++ make nasm git libtool autoconf automake libpng-dev pkgconfig
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
