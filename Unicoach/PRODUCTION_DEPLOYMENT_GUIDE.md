> ⚠️ **OUTDATED (Oct 2026).** Use [PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md](PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md) instead. This file has old domains, settings and security advice.

# 🚀 UniCoach: Complete Production Deployment Manual (Coolify + Hostinger VPS)

Yeh complete step-by-step guide hai jo tumhe scratch se lekar **100% live production** tak le jayegi. Isme Monorepo, Coolify, Docker, MongoDB, Redis, SSL aur Domains ka complete setup explain kiya gaya hai.

---

## 🏛️ 1. Production Architecture (Kaise Kaam Karega)

```mermaid
graph TD
    subgraph "🌐 Internet & DNS (Cloudflare / Domain Registrar)"
        D1["unicoach.in / www"] --> VPS["Hostinger 8GB VPS (Your IP)"]
        D2["api.unicoach.in"] --> VPS
        D3["admin.unicoach.in"] --> VPS
    end

    subgraph "🖥️ Hostinger VPS (Managed by Coolify)"
        Coolify["Coolify Reverse Proxy (Traefik / Auto SSL)"]
        
        subgraph "🐳 Isolated Docker Containers"
            FE["Frontend Container<br/>(React + Nginx :80)"]
            BE["Backend Container<br/>(Node.js :5000)"]
            ADM["Admin Container<br/>(React + Nginx :80)"]
            MDB[("MongoDB Container<br/>(:27017)")]
            RDS[("Redis Cache Container<br/>(:6379)")]
        end

        Coolify --> FE
        Coolify --> BE
        Coolify --> ADM
        BE --> MDB
        BE --> RDS
    end

    subgraph "🛡️ External Monitoring & Third-Party APIs"
        BE --> Sentry["Sentry.io (Error Tracking)"]
        BE --> Resend["Resend SMTP (Transactional Mails)"]
        BE --> Twilio["Twilio SMS (OTP Service)"]
        UptimeRobot["UptimeRobot"] -.->|"Health Checks /api/health"| BE
    end
```

---

## 📋 2. Pre-Deployment Checklist (Kya-Kya Chahiye)

Pehle yeh 3 cheezein ready rakho:
1. **Hostinger VPS:** KVM 2 ya KVM 4 (Recommended: **8 GB RAM, Ubuntu 22.04 LTS / 24.04 LTS**).
2. **Domain Name:** `unicoach.in` (GoDaddy / Hostinger / Namecheap jahan se bhi kharida ho).
3. **GitHub Repository:** `github.com/gfuid/Unicoach` (Already ready).

---

## ⚙️ 3. Step-by-Step Deployment Guide

---

### 🔹 STEP 1: Hostinger VPS Pe Coolify Install Karo

1. Apne computer ka Terminal (ya Windows PowerShell) open karo aur VPS me SSH login karo:
   ```bash
   ssh root@YOUR_VPS_IP_ADDRESS
   ```
   *(Password enter karo jab prompt aaye).*

2. VPS ke packages update karo:
   ```bash
   apt update && apt upgrade -y
   apt install curl wget git -y
   ```

3. **Coolify ka 1-Command Installer run karo:**
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
   *(Yeh script automatically Docker, Traefik Reverse Proxy aur Coolify Dashboard install kar dega. Isme 3-5 minutes lagte hain).*

4. Jab installation complete ho jaye, browser me yeh URL open karo:
   ```
   http://YOUR_VPS_IP_ADDRESS:8000
   ```
5. Apna **Admin Name**, **Email**, aur **Password** set karke Coolify Dashboard me login karo.

---

### 🔹 STEP 2: Domain DNS Records Configure Karo

Apne Domain Registrar (Hostinger / GoDaddy / Cloudflare) ke **DNS Management** me jao aur yeh 4 `A` Records add karo:

| Type | Name / Host | Value / Target (IP) | TTL | Matlab |
|---|---|---|---|---|
| **A** | `@` | `YOUR_VPS_IP_ADDRESS` | Auto / 300 | `unicoach.in` main frontend website |
| **A** | `www` | `YOUR_VPS_IP_ADDRESS` | Auto / 300 | `www.unicoach.in` redirect |
| **A** | `api` | `YOUR_VPS_IP_ADDRESS` | Auto / 300 | `api.unicoach.in` backend REST API |
| **A** | `admin` | `YOUR_VPS_IP_ADDRESS` | Auto / 300 | `admin.unicoach.in` admin CRM portal |

---

### 🔹 STEP 3: GitHub Repo Ko Coolify Se Connect Karo

1. Coolify Dashboard me **Sources** par click karo ➔ **+ Add**.
2. **GitHub App** select karo aur **Install GitHub App** par click karo.
3. Apna GitHub account login karo aur **Unicoach** repository select karke permission grant karo.
4. Coolify me tumhari repo connect ho jayegi.

---

### 🔹 STEP 4: Database & Cache Services Start Karo (1-Click)

Coolify me ek naya **Project** banao (Name: `UniCoach Production`), phir:

#### A. MongoDB Service:
1. Click **+ New Resource** ➔ **Databases** ➔ **MongoDB**.
2. Service Name: `unicoach-mongodb`.
3. Database Name: `unicoach`.
4. Username & Password: Ek strong password generate karo (note it down).
5. Click **Deploy**.
6. Deployment ke baad Coolify tumhe ek **Internal Connection String** dega (jaise `mongodb://db_user:password@unicoach-mongodb:27017/unicoach`). Yeh note karo.

#### B. Redis Service (High-Speed Caching):
1. Click **+ New Resource** ➔ **Databases** ➔ **Redis**.
2. Service Name: `unicoach-redis`.
3. Click **Deploy**.
4. Internal URL milegi: `redis://unicoach-redis:6379`.

---

### 🔹 STEP 5: Backend API Deploy Karo

1. Click **+ New Resource** ➔ **Applications** ➔ **Public / Private Repository** ➔ Select `Unicoach`.
2. App Name: `unicoach-backend`.
3. **Build & Directory Settings:**
   - **Build Pack:** `Dockerfile`
   - **Base Directory:** `/backend`
   - **Dockerfile Location:** `/backend/Dockerfile`
   - **Watch Paths:** `/backend/**`
   - **Port Expose:** `5000`
   - **Domains:** `https://api.unicoach.in` *(Coolify auto-SSL generate karega)*
4. **Persistent Storage (Uploads Folder Protection):**
   - Settings me **Storages** tab par jao.
   - Volume Name: `backend-uploads`
   - Mount Path: `/app/uploads`
   *(Isse student ke resumes aur SOPs container restart hone par bhi safe rahenge).*
5. **Environment Variables (.env):**
   Coolify ke **Environment Variables** tab me yeh add karo:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<set-in-coolify-env, never commit>
   REDIS_URL=redis://unicoach-redis:6379
   JWT_SECRET=<set-in-coolify-env, never commit>
   FRONTEND_URL=https://unicoach.in
   ADMIN_URL=https://admin.unicoach.in

   # Sentry Error Tracking
   SENTRY_DSN=<set-in-coolify-env, never commit>

   # Email (Resend)
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=<set-in-coolify-env, never commit>
   SMTP_FROM="UniCoach" <support@unicoach.in>

   # SMS OTP (Twilio)
   TWILIO_ACCOUNT_SID=<set-in-coolify-env, never commit>
   TWILIO_AUTH_TOKEN=<set-in-coolify-env, never commit>
   TWILIO_PHONE_NUMBER=+12295151611

   # AI Keys
   GROQ_API_KEY=<set-in-coolify-env, never commit>
   OPENAI_API_KEY=<set-in-coolify-env, never commit>
   SERPAPI_API_KEY=<set-in-coolify-env, never commit>
   ```
6. Click **Deploy**.

---

### 🔹 STEP 6: Frontend Website Deploy Karo

1. Click **+ New Resource** ➔ **Applications** ➔ Select `Unicoach`.
2. App Name: `unicoach-frontend`.
3. **Build & Directory Settings:**
   - **Build Pack:** `Dockerfile`
   - **Base Directory:** `/frontend`
   - **Dockerfile Location:** `/frontend/Dockerfile`
   - **Watch Paths:** `/frontend/**`
   - **Port Expose:** `80`
   - **Domains:** `https://unicoach.in, https://www.unicoach.in`
4. **Build Arguments / Environment Variables:**
   ```env
   VITE_API_BASE_URL=https://api.unicoach.in
   ```
5. Click **Deploy**.

---

### 🔹 STEP 7: Admin Panel CRM Deploy Karo

1. Click **+ New Resource** ➔ **Applications** ➔ Select `Unicoach`.
2. App Name: `unicoach-admin`.
3. **Build & Directory Settings:**
   - **Build Pack:** `Dockerfile`
   - **Base Directory:** `/admin`
   - **Dockerfile Location:** `/admin/Dockerfile`
   - **Watch Paths:** `/admin/**`
   - **Port Expose:** `80`
   - **Domains:** `https://admin.unicoach.in`
4. **Build Arguments / Environment Variables:**
   ```env
   VITE_API_BASE_URL=https://api.unicoach.in
   ```
5. Click **Deploy**.

---

## 🔒 4. Automated Daily Database Backups (Zero Data Loss)

Coolify MongoDB ka backup automatic karne ke liye:
1. Coolify dashboard me apne `unicoach-mongodb` resource par click karo.
2. **Backups** tab par jao.
3. Enable **Automated Backups**.
4. Frequency: `Every day at 02:00 AM (cron: 0 2 * * *)`.
5. Retention: `Keep last 14 days`.
6. *(Optional)* S3 / Google Drive storage connect karo for offsite backup.

---

## 📡 5. Health Monitoring & Instant Alerts (Free)

1. [UptimeRobot.com](https://uptimerobot.com) par free account banao.
2. Click **+ Add New Monitor**:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `UniCoach Backend Health`
   - **URL:** `https://api.unicoach.in/api/health`
   - **Monitoring Interval:** `Every 5 minutes`
   - **Alert Contacts:** Apna Email aur Phone (SMS/WhatsApp)
3. Click **Create Monitor**.

Ab agar server me 1 second ka bhi downtime aayega, toh tumhe turant notification mil jayegi!

---

## ✅ 6. Post-Launch Verification Checklist

Production live hone ke baad yeh 5 tests perform karo:

- [ ] **HTTPS / SSL Check:** `https://unicoach.in`, `https://api.unicoach.in`, aur `https://admin.unicoach.in` teeno green lock pad (SSL) show kar rahe hain.
- [ ] **Health Endpoint Check:** Browser me `https://api.unicoach.in/api/health` open karne par `{"status": "UP", "database": "connected"}` aana chahiye.
- [ ] **Lead Form Submit:** Homepage par jaake "Book Free Counselling" form submit karke check karo ki lead Admin Panel (`https://admin.unicoach.in`) me instant aayi ya nahi.
- [ ] **OTP SMS / Email Test:** Login karke OTP delivery verify karo.
- [ ] **Sentry Error Capture:** Sentry Dashboard par confirm karo ki live transactions record ho rahe hain.

---

## 💡 Summary: Monorepo Coolify Workflow

Jab bhi tum local system me code change karke push karoge:
```bash
git add .
git commit -m "update hero section"
git push origin main
```
Coolify **Watch Paths** detect karega:
- Agar sirf `/frontend` me change kiya ➔ **Sirf Frontend 30 sec me update hoga.**
- Agar sirf `/backend` me change kiya ➔ **Sirf Backend API 20 sec me update hoga.**
- Agar sirf `/admin` me change kiya ➔ **Sirf Admin Panel update hoga.**

Koi downtime nahi, koi manual SSH nahi — 100% automated enterprise-grade production! 🚀
