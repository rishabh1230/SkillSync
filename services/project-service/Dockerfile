FROM node:20-bullseye

WORKDIR /usr/src/app

COPY shared ./shared
COPY services/project-service ./services/project-service

WORKDIR /usr/src/app/services/project-service

RUN npm install
RUN npx prisma generate
RUN npm run build

EXPOSE 3003

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
