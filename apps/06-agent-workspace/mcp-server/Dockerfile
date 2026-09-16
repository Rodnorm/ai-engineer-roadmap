FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=8006 HOST=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 mcp && mkdir /data && chown mcp:nodejs /data
COPY --from=builder --chown=mcp:nodejs /app/package.json /app/package-lock.json ./
COPY --from=deps --chown=mcp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcp:nodejs /app/dist ./dist
USER mcp
EXPOSE 8006
VOLUME ["/data"]
CMD ["node", "dist/src/index.js"]
