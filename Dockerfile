# Multi-stage build för optimerad image-storlek
FROM node:18-alpine AS builder

# Sätt arbetskataloget
WORKDIR /app

# Kopiera package files
COPY package*.json ./

# Installera endast produktionsberoenden
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Sätt arbetskataloget
WORKDIR /app

# Kopiera node_modules från builder
COPY --from=builder /app/node_modules ./node_modules

# Kopiera applikationskod
COPY server.js ./
COPY src ./src
COPY public ./public
COPY package.json ./

# Exponera port
EXPOSE 3000

# Sätt miljövariabel för produktion
ENV NODE_ENV=production

# Starta servern
CMD ["node", "server.js"]
