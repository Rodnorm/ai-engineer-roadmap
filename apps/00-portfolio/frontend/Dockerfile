FROM node:20-alpine AS builder

WORKDIR /workspace/apps/00-portfolio/frontend

COPY apps/00-portfolio/frontend/package.json apps/00-portfolio/frontend/package-lock.json ./
RUN npm ci --workspaces=false

COPY apps/00-portfolio/frontend ./
COPY apps/00-portfolio/content ../content
COPY catalog /workspace/catalog

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

RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

WORKDIR /workspace/apps/00-portfolio/frontend
COPY --from=builder --chown=nextjs:nodejs /workspace /workspace

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
