# syntax=docker/dockerfile:1

# Imagem de produção do RadarSUS Municipal (Next.js, output "standalone").
# Algumas rotas (/, /comparador, /qualidade-dados) são pré-renderizadas em
# build time e consultam o Postgres real — por isso o build precisa das
# variáveis POSTGRES_* disponíveis, passadas via --secret (não ficam na
# imagem final). Ver justfile para os comandos prontos.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=secret,id=env_production,target=/app/.env.production \
    npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
