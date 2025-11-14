# builder
FROM node:20-slim AS builder
WORKDIR /app

# install build deps
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# runtime
FROM node:20-slim AS runtime
WORKDIR /app

# only runtime deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy built app
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
