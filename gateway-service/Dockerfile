# ---- Base stage ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# ---- Final stage ----
FROM node:20-alpine
WORKDIR /app

# Copy built files and production dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Environment variables (override in docker-compose)
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
