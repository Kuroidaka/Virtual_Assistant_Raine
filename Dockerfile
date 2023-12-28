# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.12.0

FROM node:${NODE_VERSION}-alpine

# Add the "edge" community repository, which has the latest version of Google Chrome
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories

# Install the necessary packages
RUN apk --no-cache add \
    chromium@edge \
    nss@edge \
    freetype@edge \
    harfbuzz@edge \
    ttf-freefont@edge

# Set the CHROME_BIN environment variable
ENV CHROME_BIN=/usr/bin/chromium-browser

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
