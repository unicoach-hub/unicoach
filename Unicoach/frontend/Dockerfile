# ─────────────────────────────────────────────────────────────────────────────
# UniCoach public website (React + Vite) — production image
#
# Build context : frontend/   (Coolify: Base Directory = /frontend, Dockerfile Location = /Dockerfile)
# Serves on     : port 80     (Coolify: Ports Exposes = 80). TLS is handled by Coolify's proxy.
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
# VITE_API_URL           Backend API base URL incl. /api (many components read only this one)
# VITE_GOOGLE_CLIENT_ID  Google Sign-In Web Client ID (must equal the backend's GOOGLE_CLIENT_ID)
# VITE_SENTRY_DSN        Optional, enables browser error reporting
# VITE_META_PIXEL_ID, VITE_GOOGLE_ADS_ID, VITE_GOOGLE_ADS_*_LABEL  Optional ad tracking (see .env.example)
ARG VITE_API_URL=https://api.unicoach.com/api
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_SENTRY_DSN
ARG VITE_META_PIXEL_ID
ARG VITE_GOOGLE_ADS_ID
ARG VITE_GOOGLE_ADS_LEAD_LABEL
ARG VITE_GOOGLE_ADS_SIGNUP_LABEL
ARG VITE_GOOGLE_ADS_PURCHASE_LABEL
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN} \
    VITE_META_PIXEL_ID=${VITE_META_PIXEL_ID} \
    VITE_GOOGLE_ADS_ID=${VITE_GOOGLE_ADS_ID} \
    VITE_GOOGLE_ADS_LEAD_LABEL=${VITE_GOOGLE_ADS_LEAD_LABEL} \
    VITE_GOOGLE_ADS_SIGNUP_LABEL=${VITE_GOOGLE_ADS_SIGNUP_LABEL} \
    VITE_GOOGLE_ADS_PURCHASE_LABEL=${VITE_GOOGLE_ADS_PURCHASE_LABEL} \
    NODE_OPTIONS=--max-old-space-size=3072

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
