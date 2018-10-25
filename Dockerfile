FROM node:alpine

RUN apk --update add imagemagick && \
  rm -rf /var/cache/apk/*

WORKDIR /bridge

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --no-cache --production

COPY . /bridge/
