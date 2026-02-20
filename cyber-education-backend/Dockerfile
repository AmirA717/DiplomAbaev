FROM node:20-bookworm-slim AS builder
WORKDIR /app

# 1) Сначала системные либы
RUN apt-get update && apt-get install -y \
  openssl ca-certificates libssl3 \
  libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev


FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# 3) Те же либы в рантайм
RUN apt-get update && apt-get install -y \
  openssl ca-certificates libssl3 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main.js"]
