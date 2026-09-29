# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci

# Código-fonte e build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --production

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

USER nextjs

EXPOSE 3002

CMD ["npm", "start"]
