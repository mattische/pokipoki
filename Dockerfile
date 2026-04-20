# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# production
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY server.js ./
COPY src ./src
COPY public ./public
COPY package.json ./

ENV PORT=80
ENV NODE_ENV=production

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/up || exit 1

CMD ["node", "server.js"]