FROM oven/bun:1 AS builder
WORKDIR /app

COPY . .

RUN bun run build

FROM oven/bun:1 AS runtime
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.js ./server.js
COPY metrics.js ./metrics.js
COPY package.json ./package.json

# Install only production deps (prom-client)
RUN bun install --production

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

CMD ["bun", "server.js", "--root", "dist"]
