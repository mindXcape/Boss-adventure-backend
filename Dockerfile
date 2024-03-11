# Install dependencies only when needed
FROM node:18-alpine3.17 AS devdeps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install

FROM node:18-alpine3.17 AS builder
WORKDIR /usr/src/app
COPY --from=devdeps /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM node:18-alpine3.17 AS deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --production && yarn cache clean


FROM node:18-alpine3.17 AS prod
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/.env ./.env
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/prisma ./prisma
COPY --chown=node:node package.json yarn.lock ./
CMD [ "node", "dist/src/main.js" ]