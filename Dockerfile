FROM node:22-slim AS base

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# モノレポ依存関係インストール
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile || pnpm install

# ソースコピー
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# ---------- Backend ----------
FROM base AS backend
WORKDIR /app/backend
RUN mkdir -p data
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---------- Frontend ----------
FROM base AS frontend
WORKDIR /app/frontend
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
