# Stage 1: Build Stage
FROM node:20-alpine3.17 AS build

# Set the working directory
WORKDIR /usr/src/app

# Install OpenSSL for Prisma and other dependencies
RUN apk add --no-cache openssl

# Copy the package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --force

# Copy the rest of the application files
COPY . ./

# Add 'linux-musl' binary target in Prisma schema and generate Prisma Client
RUN npx prisma generate

# Build the application (e.g., for TypeScript -> JavaScript)
RUN npm run build


# Stage 2: Dependencies Stage
FROM node:20-alpine3.17 AS deps

# Set the working directory
WORKDIR /usr/src/app

# Copy the package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev --force && npm cache clean --force


# Stage 3: Production Stage
FROM node:20-alpine3.17 AS production

# Run as a non-root user for security
USER node

# Set the working directory
WORKDIR /usr/src/app

# Install OpenSSL for Prisma in production
RUN apk add --no-cache openssl

# Copy the compiled application and necessary files
COPY --chown=node:node --from=build /usr/src/app/dist/src ./src
COPY --chown=node:node --from=build /usr/src/app/.env .env
COPY --chown=node:node --from=build /usr/src/app/package.json .
COPY --chown=node:node --from=build /usr/src/app/package-lock.json .
COPY --chown=node:node --from=deps /usr/src/app/node_modules/ ./node_modules/
COPY --chown=node:node --from=build /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma/
COPY --chown=node:node --from=build /usr/src/app/tsconfig.json .

# Set environment to production
ENV NODE_ENV production

# Expose the application port
EXPOSE 3333

# Start the server
CMD [ "node", "src/main.js" ]
