FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --workspaces=false

FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

ARG NEXT_PUBLIC_APP_01_URL
ARG NEXT_PUBLIC_APP_02_URL
ARG NEXT_PUBLIC_APP_03_URL
ARG NEXT_PUBLIC_APP_04_URL
ARG NEXT_PUBLIC_APP_05_URL
ENV NEXT_PUBLIC_APP_01_URL=$NEXT_PUBLIC_APP_01_URL \
    NEXT_PUBLIC_APP_02_URL=$NEXT_PUBLIC_APP_02_URL \
    NEXT_PUBLIC_APP_03_URL=$NEXT_PUBLIC_APP_03_URL \
    NEXT_PUBLIC_APP_04_URL=$NEXT_PUBLIC_APP_04_URL \
    NEXT_PUBLIC_APP_05_URL=$NEXT_PUBLIC_APP_05_URL

RUN npm run build

FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/catalog ./catalog
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
