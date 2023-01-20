FROM node:19-alpine3.16

WORKDIR /usr/src/app

COPY package.json ./
RUN npm config set strict-ssl false
RUN npm install
COPY ./server.js ./

CMD ["npm","start"]
