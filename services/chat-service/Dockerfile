FROM node:20-bullseye

WORKDIR /usr/src/app

COPY shared ./shared
COPY services/chat-service ./services/chat-service

WORKDIR /usr/src/app/services/chat-service

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3005

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
