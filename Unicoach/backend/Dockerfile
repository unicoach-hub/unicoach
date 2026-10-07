# ─────────────────────────────────────────────────────────────────────────────
# UniCoach Backend API (Express + Mongoose) — production image
#
# Build context : backend/          (Coolify: Base Directory = /backend, Dockerfile Location = /Dockerfile)
# Listens on    : PORT (default 5000) (Coolify: Ports Exposes = 5000)
# Health check  : GET /api/health    (200 only when MongoDB is connected, 503 otherwise)
# Writable data : /app/uploads       (mount a Coolify *Volume* here so files survive redeploys)
#
# All configuration comes from runtime environment variables (see .env.example).
# In Coolify, untick "Build Variable" for every backend variable: nothing is needed at build time,
# and build args would otherwise show up in build logs / image history.
# ─────────────────────────────────────────────────────────────────────────────

# ---------- Stage 1: production dependencies only ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy only the manifests so this layer stays cached until dependencies change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund


# ---------- Stage 2: runtime ----------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

# Dependencies from stage 1, then the source code.
# .dockerignore keeps .env files, uploads/, backups/, scratch/ and tests out of the image.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Uploads folder (multer, docx images, mentor resources in uploads/unicoach, temp files).
# The code stays owned by root (read-only for the app); only this folder is writable by the app user.
# A fresh Docker volume mounted here copies this ownership, so the app can write to it.
RUN mkdir -p /app/uploads/unicoach /app/uploads/temp \
 && chown -R node:node /app/uploads

# Run as the unprivileged "node" user (uid 1000) that ships with the official image
USER node

EXPOSE 5000

# busybox wget is built into Alpine and exits non-zero on HTTP errors (503 = DB not connected).
# Coolify uses this check for zero-downtime deploys: a new container that cannot reach
# MongoDB never receives traffic and the old container keeps running.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -T 4 -O /dev/null "http://127.0.0.1:${PORT:-5000}/api/health" || exit 1

# Exec form: node is PID 1 and receives SIGTERM directly (server.js shuts down gracefully)
CMD ["node", "server.js"]
