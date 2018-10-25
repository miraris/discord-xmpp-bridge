FROM node:alpine

WORKDIR /bridge

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --no-cache --production

COPY . /bridge/
