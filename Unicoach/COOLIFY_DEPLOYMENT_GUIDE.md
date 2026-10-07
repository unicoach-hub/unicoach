> ⚠️ **OUTDATED (Oct 2026).** Use [PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md](PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md) instead. This file has old domains, settings and security advice.

# 🚀 UniCoach Deployment Guide: Hostinger VPS + Coolify

This guide walks you through deploying **UniCoach** (Frontend, Admin, Backend, MongoDB, and Redis) on **Hostinger VPS** using **Coolify**.

---

## 📋 Prerequisites

1. **Hostinger VPS**: Ubuntu 22.04 or 24.04 (Minimum 4GB RAM recommended, e.g., Hostinger KVM 2 or KVM 4).
2. **Domain Name**: A domain (e.g., `unicoach.com`) with DNS access (Cloudflare recommended).
3. **GitHub Repository**: Push your `unicoach` codebase to a private repository on GitHub.

---

## 🛠️ Step 1: Install Coolify on Hostinger VPS

1. Connect to your Hostinger VPS via SSH (Terminal / PuTTY):
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```
2. Run the official 1-line Coolify installation script:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Once installation completes, open your browser and navigate to:
   ```
   http://<YOUR_VPS_IP>:8000
   ```
4. Create your Admin account on Coolify.

---

## 🗄️ Step 2: Deploy Databases on Coolify

### A. Deploy MongoDB
1. In Coolify Dashboard -> Click **+ New Resource** -> Select **Databases** -> **MongoDB**.
2. Set Name: `unicoach-mongodb`
3. Set Database Name: `unicoach`
4. Set Username: `admin` and generate a secure password.
5. Click **Deploy**. Copy the Internal Connection URI (e.g., `mongodb://admin:PASSWORD@unicoach-mongodb:27017/unicoach?authSource=admin`).

### B. Deploy Redis
1. Click **+ New Resource** -> Select **Databases** -> **Redis**.
2. Set Name: `unicoach-redis`
3. Click **Deploy**. Copy the Internal Connection URL (e.g., `redis://unicoach-redis:6379`).

---

## ⚡ Step 3: Deploy Backend API Service

1. Click **+ New Resource** -> Select **Public Repository** or **GitHub App** -> Choose your `unicoach` repository.
2. Set **Base Directory**: `/backend`
3. Set **Build Pack**: `Dockerfile`
4. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb://admin:YOUR_PASSWORD@unicoach-mongodb:27017/unicoach?authSource=admin
   REDIS_URL=redis://unicoach-redis:6379
   JWT_SECRET=your_super_secret_64_char_key
   FRONTEND_URL=https://unicoach.com
   ADMIN_URL=https://admin.unicoach.com
   ```
5. In **Domains**, set your API domain: `https://api.unicoach.com` (Port 5000).
6. Set **Health Check Path**: `/api/health`
7. Click **Deploy**!

---

## 🌐 Step 4: Deploy Frontend & Admin Apps

### A. Deploy Main Frontend (`https://unicoach.com`)
1. Click **+ New Resource** -> Select your `unicoach` repository.
2. Set **Base Directory**: `/frontend`
3. Set **Build Pack**: `Dockerfile`
4. In **Environment Variables** (or Build Args):
   ```env
   VITE_API_BASE_URL=https://api.unicoach.com
   ```
5. In **Domains**, set: `https://unicoach.com`
6. Click **Deploy**!

### B. Deploy Admin Panel (`https://admin.unicoach.com`)
1. Click **+ New Resource** -> Select your `unicoach` repository.
2. Set **Base Directory**: `/admin`
3. Set **Build Pack**: `Dockerfile`
4. In **Environment Variables**:
   ```env
   VITE_API_BASE_URL=https://api.unicoach.com
   ```
5. In **Domains**, set: `https://admin.unicoach.com`
6. Click **Deploy**!

---

## 🛡️ Step 5: Configure DNS in Cloudflare

Add these 3 **A Records** in Cloudflare pointing to your **Hostinger VPS IP**:

| Type | Name | Target | Proxy Status |
| :--- | :--- | :--- | :--- |
| **A** | `@` (unicoach.com) | `<YOUR_VPS_IP>` | Proxied (Orange Cloud) |
| **A** | `api` | `<YOUR_VPS_IP>` | Proxied (Orange Cloud) |
| **A** | `admin` | `<YOUR_VPS_IP>` | Proxied (Orange Cloud) |

Coolify will automatically issue free SSL certificates (HTTPS) via Let's Encrypt / Cloudflare!

---

## ✅ Step 6: Verify Deployment

1. Visit `https://api.unicoach.com/api/health` -> Should return `{"status":"UP","database":"connected"}`.
2. Visit `https://unicoach.com/sitemap.xml` -> Should render your SEO sitemap.
3. Visit `https://unicoach.com/robots.txt` -> Should render crawler instructions.

🎉 **Congratulations! Your UniCoach platform is now live on Hostinger VPS with enterprise-level speed, Redis caching, and automated SSL!**
