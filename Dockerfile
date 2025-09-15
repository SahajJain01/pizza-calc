FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json ./
COPY bun.lockb* ./
RUN bun install --ci || bun install

# Copy the rest of the app and build static assets
COPY . .
RUN bun run build

FROM oven/bun:1 AS runtime
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY server.js ./server.js

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

CMD ["bun", "server.js", "--root", "dist"]
