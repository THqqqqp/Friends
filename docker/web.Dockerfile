# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20.17.0
ARG PNPM_VERSION=10.12.1

FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION}

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend ./frontend
COPY admin ./admin

RUN pnpm install --filter frontend --filter admin --frozen-lockfile

ARG VITE_API_BASE_URL=/api
ARG VITE_UPLOAD_BASE_URL=/uploads
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_UPLOAD_BASE_URL=${VITE_UPLOAD_BASE_URL}

RUN pnpm --filter frontend run build
RUN pnpm --filter admin run build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html/client
COPY --from=builder /app/admin/dist /usr/share/nginx/html/admin

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
