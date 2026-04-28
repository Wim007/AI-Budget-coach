# Stage 1: TypeScript compileren
FROM node:20-alpine AS builder

# python3/make/g++ zijn nodig om better-sqlite3 (native module) te compileren
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Productie-image (alleen compiled JS + prod-deps)
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# npm ci --omit=dev hercompileert better-sqlite3 voor deze Alpine-versie
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Zorg dat schrijfbare mappen bestaan
RUN mkdir -p data uploads

EXPOSE 3001
CMD ["node", "dist/index.js"]
