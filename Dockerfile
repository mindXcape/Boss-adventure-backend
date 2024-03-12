FROM node:18-alpine As builder

# Create app directory
WORKDIR /app

COPY package*.json ./


RUN npm install


COPY prisma ./prisma/


# Bundle app source
COPY . .

RUN npx prisma generate

# RUN npx prisma db push

# RUN npx prisma db seed

RUN npm run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./


EXPOSE 8080

CMD [  "npm", "run", "start:migrate:prod" ]
