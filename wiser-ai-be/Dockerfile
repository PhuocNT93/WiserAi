FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

COPY . .

# Dummy DATABASE_URL to satisfy Prisma during build
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wiser_ai"

RUN yarn prisma generate
RUN yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./
COPY --from=builder /app/tsconfig.seed.json ./
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 8000

CMD [ "yarn", "start:prod" ]
