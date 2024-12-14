FROM node:20-alpine3.17 As build
WORKDIR /usr/src/app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm install --force
COPY . ./
RUN npm run prisma:generate
RUN npm run build

FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json package-lock.json ./
RUN npm install --omit=dev --force && npm cache clean --force

FROM node:18-alpine As production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/dist/src ./src
COPY --chown=node:node --from=build /usr/src/app/.env .env
COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=deps /usr/src/app/node_modules/ ./node_modules/
COPY --chown=node:node --from=build /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma/
COPY --chown=node:node --from=build /usr/src/app/tsconfig.json .

ENV NODE_ENV production
EXPOSE 3333

# Start the server using the production build
CMD [ "node", "src/main.js"]