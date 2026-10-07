# ─────────────────────────────────────────────────────────────────────────────
# UniCoach Admin Panel (React + Vite) — production image
#
# Build context : admin/   (Coolify: Base Directory = /admin, Dockerfile Location = /Dockerfile)
# Serves on     : port 80  (Coolify: Ports Exposes = 80). TLS is handled by Coolify's proxy.
#
# Stage 1 builds the static site with Node, stage 2 serves dist/ with nginx (see nginx.conf).
# ─────────────────────────────────────────────────────────────────────────────

# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer stays cached until package*.json changes.
# --include=dev: Vite and its plugins are devDependencies; keep them even if NODE_ENV=production
# is ever injected as a build argument.
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# VITE_* values are baked into the JavaScript bundle at BUILD time.
#  - In Coolify add them as Environment Variables with "Build Variable" ticked.
#  - Changing one needs a Redeploy (rebuild), not just a Restart.
#  - They are public (they end up in the browser): never put secrets in a VITE_* variable.
# VITE_API_URL       Backend API base URL incl. /api
# VITE_FRONTEND_URL  Public website URL, used for shareable form/booking links
# VITE_SENTRY_DSN    Optional, enables browser error reporting
ARG VITE_API_URL=https://api.unicoach.com/api
ARG VITE_FRONTEND_URL=https://www.unicoach.com
ARG VITE_SENTRY_DSN
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_FRONTEND_URL=${VITE_FRONTEND_URL} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN}

RUN npm run build


# ---------- Stage 2: serve ----------
FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# /healthz is answered by nginx itself (see nginx.conf); busybox wget ships with Alpine
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -T 4 -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
