FROM node:20-bullseye AS base

WORKDIR /opt/mediasoup

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000

ENV NODE_ENV=production \
    HTTP_PORT=3000

CMD ["node", "index.js"]

