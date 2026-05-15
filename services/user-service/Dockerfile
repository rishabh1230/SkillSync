FROM node:20-bullseye

WORKDIR /usr/src/app

COPY shared ./shared
COPY services/user-service ./services/user-service

WORKDIR /usr/src/app/services/user-service

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3002

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
