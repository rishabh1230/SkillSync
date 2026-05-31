FROM node:20-bullseye

WORKDIR /usr/src/app

COPY shared ./shared
COPY services/hackathon-service ./services/hackathon-service

WORKDIR /usr/src/app/services/hackathon-service

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3004

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
