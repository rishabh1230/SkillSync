FROM node:20-alpine

WORKDIR /usr/src/app

COPY shared ./shared
COPY api-gateway ./api-gateway

WORKDIR /usr/src/app/api-gateway

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
