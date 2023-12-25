# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.12.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY .env ./

# generated prisma files
COPY prisma ./prisma/

COPY . .

RUN npm install

RUN npx prisma generate

# Run Prisma command to push schema changes to the database
RUN npx prisma db push

USER node

EXPOSE 8000

CMD npm run build:prod
