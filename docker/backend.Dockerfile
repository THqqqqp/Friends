# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20.17.0
ARG PNPM_VERSION=10.12.1

FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION} \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend

RUN pnpm install --filter backend --frozen-lockfile
RUN pnpm --filter backend run build

FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION}

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

RUN pnpm install --filter backend --prod --frozen-lockfile

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/database ./backend/database

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/server.js"]
