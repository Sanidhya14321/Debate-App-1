# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
