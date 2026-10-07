# UniCoach Production Deployment Guide (Hostinger VPS + Coolify)

This is the **one guide to follow** to put UniCoach live on `unicoach.com` (it replaces the old WordPress
site there; `www.unicoach.com` is the main address). `unicoach.in` keeps working and redirects to it.
Go top to bottom. Every command block can be copied as it is; only replace the `<PLACEHOLDERS>`.

> **Older guides:** `COOLIFY_DEPLOYMENT_GUIDE.md`, `PRODUCTION_DEPLOYMENT_GUIDE.md` and
> `VPS_DATABASE_SETUP_GUIDE.md` are **out of date** (wrong build variable name, MongoDB inside
> Coolify, `0.0.0.0/0` database access, PM2/manual nginx, wrong watch-path format). Use this file.
>
> **Before go-live:** any API key that was ever written in a committed file (older guides had real
> keys) must be **regenerated** in that provider's dashboard. Treat it as leaked.

**Placeholders used below**

| Placeholder | Meaning |
|---|---|
| `<VPS_IP>` | Public IPv4 of the Hostinger VPS |
| `<cluster-host>` | Your Atlas cluster host, e.g. `unicoach-prod.ab1cd.mongodb.net` |
| `<APP_DB_PASSWORD>` / `<BACKUP_DB_PASSWORD>` | Atlas database user passwords (letters + digits only) |
| `<ACCOUNT_ID>` | Cloudflare account ID (for R2) |

---

## 0. Architecture and monthly cost

```
                         Students / mentors / admins (browsers)
                                        │ HTTPS
                       ┌────────────────▼─────────────────┐
                       │ DNS for unicoach.com (Bluehost)   │  @, www, admin, api, coolify
                       │ (Cloudflare optional, later)      │  → A records to the VPS IP
                       └────────────────┬─────────────────┘
                                        │ ports 80 / 443 only
┌───────────────────────────────────────▼────────────────────────────────────────┐
│ Hostinger VPS KVM 2 · Mumbai · Ubuntu 24.04 · 2 vCPU / 8 GB RAM / NVMe          │
│                                                                                 │
│  Coolify proxy (Traefik) ── free Let's Encrypt HTTPS ── routes by domain name   │
│      │                    │                         │                           │
│      ▼                    ▼                         ▼                           │
│  frontend (nginx :80)   admin (nginx :80)      backend (Node 22 :5000)          │
│  www.unicoach.com       admin.unicoach.com      api.unicoach.com                  │
│  unicoach.com → www                              │   ├─ volume  /app/uploads     │
│                                                  │   └─ Redis (internal only)    │
│  Coolify dashboard: coolify.unicoach.com          │                               │
│  cron 03:00 IST: backup ─────────────────────────┼──────────► Cloudflare R2      │
└──────────────────────────────────────────────────┼──────────────────────────────┘
                                                   ▼
   MongoDB Atlas Flex (Mumbai) · Cloudinary (files) · Resend (email, booking.unicoach.com)
   Razorpay (payments) · Google Sign-In · Groq/OpenAI (AI) · Twilio (SMS) · Sentry
```

**Approximate monthly cost** (verify current prices before buying; INR at about ₹85 = $1)

| Item | Plan | Approx. per month |
|---|---|---|
| Hostinger VPS | KVM 2 (2 vCPU, 8 GB, 100 GB NVMe, 8 TB traffic), 12–24 month term | ₹700–1,200 (offer price vs renewal) |
| MongoDB Atlas | Flex (5 GB, up to 500 ops/sec), billed by usage | $8–30 (≈ ₹700–2,600), usually near $8 |
| Cloudflare | DNS + optional proxy, Free plan | ₹0 |
| Cloudflare R2 | Backups. First 10 GB-month free, then ~$0.015/GB | ₹0–50 |
| Cloudinary | Free plan (25 monthly credits) | ₹0 (paid plans cost much more, watch usage) |
| Resend | Free: 3,000 emails/month, 100/day. Pro ≈ $20 for 50k | ₹0–1,700 |
| Domains `unicoach.com` (+ `unicoach.in`) | Yearly renewals | ≈ ₹100–250 |
| UptimeRobot, Sentry | Free plans | ₹0 |
| Razorpay | No monthly fee, ~2% + GST per payment | per payment |
| Groq / OpenAI / Twilio | Pay per use | depends on usage |
| **Fixed total** | | **≈ ₹1,500 – 4,000 / month** |

When the database grows past 5 GB or needs more speed, upgrade Atlas Flex → **M10 dedicated**
(roughly $60–70/month in Mumbai, verify). It is a one-click upgrade in Atlas.

---

## 1. Buy the VPS on Hostinger

1. On your Windows laptop, open **PowerShell** and create an SSH key (press Enter for the default path,
   then set a passphrase you will remember):
   ```powershell
   ssh-keygen -t ed25519 -C "unicoach-vps"
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
   ```
   Copy the whole line that starts with `ssh-ed25519`. This is your **public** key (safe to paste).
   Never share the file without `.pub`.
2. Go to `https://www.hostinger.com/in/vps-hosting` and choose **KVM 2**.
   A 12 or 24 month term is much cheaper per month.
3. During setup:
   - **Location:** India (Mumbai). If not offered, choose the nearest Asia location.
   - **Operating system:** plain **Ubuntu 24.04 LTS** (not a control panel, not "with Coolify";
     we harden the server first and install Coolify ourselves).
   - **Root password:** long random password, save it in a password manager.
   - **SSH key:** paste the public key from step 1.
4. When the VPS is ready, note the **IPv4 address** (`<VPS_IP>`) from hPanel → VPS → Overview.
5. Test login from PowerShell:
   ```powershell
   ssh root@<VPS_IP>
   ```

---

## 2. Harden the server

All commands run on the VPS. Lines starting with `sudo` are for after you create the `deploy` user.

### 2.1 Update everything (as root)

```bash
apt update && apt -y full-upgrade
reboot
```
Wait one minute and log in again with `ssh root@<VPS_IP>`.

> Keep the server clock on **UTC** (Hostinger default). IST = UTC + 5:30. All cron times below are UTC.

### 2.2 Create a normal admin user with sudo (as root)

```bash
adduser deploy                      # set a strong password (needed for sudo)
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy   # same SSH key works for deploy
```

Open a **second** PowerShell window (keep the first one open in case something goes wrong):
```powershell
ssh deploy@<VPS_IP>
```
```bash
sudo whoami      # must print: root
```

### 2.3 SSH: keys only, no passwords

Root login stays allowed **with a key only**: Coolify manages its own server over SSH as root
using a key it creates. Password logins are switched off for everyone.

The file name starts with `01-` on purpose: sshd uses the **first** value it reads, and Ubuntu
cloud images may ship a `50-cloud-init.conf` that turns passwords back on.

```bash
sudo tee /etc/ssh/sshd_config.d/01-unicoach-hardening.conf > /dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
MaxAuthTries 3
X11Forwarding no
EOF
sudo sshd -t && sudo systemctl restart ssh
sudo sshd -T | grep -Ei '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin)'
```
Expected output:
```
passwordauthentication no
kbdinteractiveauthentication no
permitrootlogin without-password
```
(`without-password` is the same as `prohibit-password`.) Now test again in a **new** window that
`ssh deploy@<VPS_IP>` still works **before** closing the old window.

### 2.4 Swap (protects builds from running out of memory)

The frontend build is heavy. A 4 GB swap file avoids "killed" builds.
```bash
free -h          # if "Swap:" already shows 2G or more, skip this block
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl --system > /dev/null && free -h
```

### 2.5 Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Let's Encrypt + redirect to HTTPS)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 443/udp     # HTTP/3 (optional)
sudo ufw allow 8000/tcp    # TEMPORARY: Coolify dashboard during setup
sudo ufw allow 6001/tcp    # TEMPORARY: Coolify realtime updates during setup
sudo ufw allow 6002/tcp    # TEMPORARY: Coolify web terminal during setup
sudo ufw enable
sudo ufw status verbose
```

> **Important:** Docker writes its own firewall rules, so ports published by Docker containers
> (Coolify's 8000/6001/6002 and Traefik's 8080) **skip UFW**. UFW protects SSH and the host, but to
> really close the Coolify ports you must use the **Hostinger firewall** in hPanel (step 3.4).
> That firewall filters traffic before it reaches the VPS.

### 2.6 Automatic security updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades     # choose "Yes"
```
Some updates need a reboot. Once a month (at night) run:
```bash
[ -f /var/run/reboot-required ] && sudo reboot
```
All Coolify apps start again automatically after a reboot (about 1–2 minutes of downtime).

### 2.7 Fail2ban (blocks SSH brute-force)

```bash
sudo apt install -y fail2ban
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd
# never ban localhost or Docker's internal networks (Coolify talks to the host from there)
ignoreip = 127.0.0.1/8 ::1 10.0.0.0/8 172.16.0.0/12

[sshd]
enabled = true
EOF
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```
If fail2ban does not start, run `sudo apt update && sudo apt install --only-upgrade fail2ban`
(early Ubuntu 24.04 packages had a bug) and start it again.

---

## 3. Install and secure Coolify

### 3.1 Install (official installer, must run as root)

```bash
sudo -i
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
exit
```
It installs Docker and Coolify (3–5 minutes).

### 3.2 Create the admin account immediately

Open `http://<VPS_IP>:8000` right away. **The first person who opens the registration page becomes
the admin**, so do it now. Use your email and a long random password from a password manager.
In the onboarding, choose **"This Machine" / localhost** as the server.

### 3.3 Dashboard on its own domain + 2FA

1. In Cloudflare DNS add `A  coolify  <VPS_IP>`  **DNS only (grey cloud)**. If the domain is not on
   Cloudflare yet, do section 5.1 first.
2. Coolify → **Settings → General → Domain (Instance's Domain)**: `https://coolify.unicoach.com` → Save.
   Wait 1–2 minutes, then open `https://coolify.unicoach.com` and log in.
3. Your profile (top-right) → **Two-Factor Authentication** → enable it with Google Authenticator /
   Authy / 1Password. Save the recovery codes in your password manager.
4. **Settings** → turn **off "Registration Allowed"** so nobody else can create an account.
5. Keep Coolify **auto-update on** (it brings security fixes).
6. Save Coolify's own secret file (needed to restore Coolify on a new server):
   ```bash
   sudo cp /data/coolify/source/.env /home/deploy/coolify-env-backup
   sudo chown deploy:deploy /home/deploy/coolify-env-backup
   ```
   From your laptop (PowerShell):
   ```powershell
   scp deploy@<VPS_IP>:coolify-env-backup .\coolify-env-backup.txt
   ```
   Store the file in your password manager / a safe offline place, then on the VPS:
   ```bash
   rm /home/deploy/coolify-env-backup
   ```

### 3.4 Close the setup ports

1. hPanel → your VPS → **Security → Firewall** (menu names may differ slightly) → create a firewall
   configuration with **Accept** rules only for: TCP 22, TCP 80, TCP 443, UDP 443. Everything else is
   dropped. Activate/sync it for this VPS.
2. Remove the temporary UFW rules:
   ```bash
   sudo ufw delete allow 8000/tcp
   sudo ufw delete allow 6001/tcp
   sudo ufw delete allow 6002/tcp
   sudo ufw status
   ```
3. Check: `http://<VPS_IP>:8000` and `http://<VPS_IP>:8080` must **not** load any more, while
   `https://coolify.unicoach.com` still works (including the Terminal tab of an app).

### 3.5 Coolify settings to double-check

- **Servers → localhost → Docker cleanup:** keep **"Delete Unused Volumes" OFF**. If it is on, a stopped
  backend could lose its uploads volume.
- **Settings → Notifications:** add your email (or Telegram/Discord) so you hear about failed deployments.

---

## 4. MongoDB Atlas production cluster

The current Atlas cluster becomes **development** (your local `backend/.env` keeps using it).
Production gets a **new, separate** cluster.

### 4.1 Check the data fits in Flex

Flex limits: **5 GB** data + indexes, 500 ops/sec, 500 connections, one automatic snapshot per day.
In the **current** cluster → Overview, check "Data Size". If it is above ~4 GB, choose **M10** instead.

### 4.2 Create the cluster

1. Atlas → **New Project** → name `UniCoach Production` (separate project = separate users and IP list).
2. **Create cluster → Flex**.
   - Provider/region: **AWS → Mumbai (ap-south-1)**. If Mumbai is not offered for Flex on AWS,
     choose **Google Cloud → Mumbai (asia-south1)**. Both are in Mumbai, near the VPS.
   - Name: `unicoach-prod`.
3. Project → **Alerts / Project Settings**: make sure alert emails go to you.

### 4.3 Database users (least privilege)

Security → **Database Access → Add New Database User** (authentication: Password, use
**Autogenerate Secure Password** so it has only letters and digits):

| Username | Privileges ("Specific Privileges") | Used by |
|---|---|---|
| `unicoach_app` | `readWrite` on database `unicoach` | backend `MONGO_URI`, data migration |
| `unicoach_backup` | `read` on database `unicoach` | daily backup script |

### 4.4 Network access = VPS only

Security → **Network Access → Add IP Address** → `<VPS_IP>/32`, comment "Hostinger VPS".
Do **not** add `0.0.0.0/0`. If you need to connect from your laptop (Compass), add your current IP
temporarily and delete it afterwards.

### 4.5 Connection string

Cluster → **Connect → Drivers** → copy the string and put `/unicoach` before the `?`:
```
mongodb+srv://unicoach_app:<APP_DB_PASSWORD>@<cluster-host>/unicoach?retryWrites=true&w=majority&appName=unicoach
```
This is the backend `MONGO_URI`.

### 4.6 Move the data from the current cluster

Do a **test run** any time. On launch day do it **again** right before switching DNS, after stopping
writes on the old site (suspend the old backend on Render, or put the site in maintenance), so no new
leads/bookings are lost.

Run on the VPS (Docker is already there). First make sure the **old** cluster's Network Access allows
`<VPS_IP>` (add it temporarily if it does not have it).

```bash
mkdir -p ~/migration && cd ~/migration
# Lines starting with a SPACE are not saved in bash history (keeps passwords out of it)
 OLD_URI='mongodb+srv://<OLD_USER>:<OLD_PASSWORD>@<old-cluster-host>/'
 NEW_URI='mongodb+srv://unicoach_app:<APP_DB_PASSWORD>@<cluster-host>/'

# 1) Dump only the "unicoach" database from the old cluster
sudo docker run --rm -v "$PWD":/backup mongo:8.0 \
  mongodump --uri="$OLD_URI" --db=unicoach --gzip --archive=/backup/unicoach.archive.gz

# 2) Restore into the new cluster (--drop replaces data from an earlier test run)
sudo docker run --rm -v "$PWD":/backup mongo:8.0 \
  mongorestore --uri="$NEW_URI" --nsInclude='unicoach.*' --drop --gzip --archive=/backup/unicoach.archive.gz
```

**Verify document and index counts match:**
```bash
cat > count.js <<'EOF'
const d = db.getSiblingDB('unicoach');
d.getCollectionNames().sort().forEach(c => {
  const coll = d.getCollection(c);
  print(c + '  docs=' + coll.countDocuments({}) + '  indexes=' + coll.getIndexes().length);
});
EOF
sudo docker run --rm -v "$PWD":/w mongo:8.0 mongosh "$OLD_URI" --quiet /w/count.js > old-counts.txt
sudo docker run --rm -v "$PWD":/w mongo:8.0 mongosh "$NEW_URI" --quiet /w/count.js > new-counts.txt
diff old-counts.txt new-counts.txt && echo "ALL COUNTS MATCH"
```
If `diff` prints lines, something was written to the old cluster after the dump (or the restore
failed): read the mongorestore output and repeat steps 1–2.

After launch: remove `<VPS_IP>` from the **old** cluster's Network Access, and after 7 days delete the
local copy (it contains personal data): `rm -rf ~/migration`.

---

## 5. DNS for `unicoach.com`

Today `unicoach.com` uses **Bluehost** DNS (it also hosts the old WordPress site). The simplest, lowest-risk
switch is to keep DNS at Bluehost and only change the web records. Moving DNS to Cloudflare is optional and
can be done later.

### 5.1 Before you change anything
1. **Back up the WordPress site** (Bluehost → Website → Backups, or download files + database). Once the
   records point to the VPS, the old site is no longer reachable by its domain.
2. Bluehost → **Domains → DNS** → take a screenshot of **all** records. Do **not** delete:
   - `MX` records of `unicoach.com` (if any mailbox like `info@unicoach.com` lives there),
   - the **Resend** records for `booking.unicoach.com` (`resend._domainkey.booking` TXT,
     `send.booking` MX and TXT) — without them booking emails stop,
   - any `TXT` verification records (Google Search Console, etc.).
3. The day before: lower the TTL of the `@` and `www` records to 300 seconds (5 minutes) if Bluehost
   allows it, so the switch spreads quickly.

### 5.2 Records for the VPS
Change or add only these (replace the old `@`/`www` targets that point to Bluehost hosting):

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` (unicoach.com) | `<VPS_IP>` | 300 |
| A | `www` | `<VPS_IP>` (if `www` is a CNAME today, delete it and add this A record) | 300 |
| A | `admin` | `<VPS_IP>` | 300 |
| A | `api` | `<VPS_IP>` | 300 |
| A | `coolify` | `<VPS_IP>` | 300 |

Do not add `AAAA` (IPv6) records for these names; the setup here is IPv4 only.

Check from your laptop (both should print `<VPS_IP>`):
```powershell
nslookup www.unicoach.com 1.1.1.1
nslookup api.unicoach.com 1.1.1.1
```

### 5.3 `unicoach.in` (second domain)
Point `unicoach.in` and `www.unicoach.in` (A records) to the same `<VPS_IP>` and add both names to the
frontend app's Domains in Coolify. The frontend's nginx sends every `.in` URL to the same page on
`https://www.unicoach.com` with a permanent 301, so Google merges both into one site.

### 5.4 Optional later: Cloudflare
If you move `unicoach.com` to Cloudflare later: copy every record first (5.1), keep `api` **DNS only
(grey)** — the API limits OTP/login attempts per visitor IP and behind the proxy all students would share
Cloudflare's IP — and use SSL mode **Full (strict)**, never "Flexible".

### 5.5 Email records
Resend for `booking.unicoach.com` is already verified; just keep its records. Add a DMARC record for the
main domain if you have none:
```
TXT  _dmarc   "v=DMARC1; p=none; rua=mailto:<your-email>"
```

---

## 6. Deploy the apps in Coolify

### 6.1 Project and GitHub

1. Coolify → **Projects → + Add** → `UniCoach` (environment `production`).
2. **Sources → + Add → GitHub App** → register it → install it on GitHub with
   **"Only select repositories" → `Unicoach`**.

### 6.2 Redis (internal cache and locks)

1. Project → **+ New → Database → Redis** (default version), on the same server as the apps.
   Name: `unicoach-redis`.
2. Keep **"Make it publicly available" OFF** (Redis must never be reachable from the internet).
3. **Start**. Copy the **Redis URL (internal)**, it looks like
   `redis://default:<password>@<random-id>:6379/0`. This is `REDIS_URL`.

### 6.3 Backend (`api.unicoach.com`)

1. Project → **+ New → Private Repository (with GitHub App)** → `Unicoach`, branch `main`.
2. Settings:

   | Field | Value |
   |---|---|
   | Build Pack | **Dockerfile** |
   | Base Directory | `/backend` |
   | Dockerfile Location | `/Dockerfile` (relative to the base directory) |
   | Ports Exposes | `5000` |
   | Ports Mappings | *(empty, otherwise zero-downtime deploys cannot work)* |
   | Domains | `https://api.unicoach.com` |
   | Watch Paths | `backend/**` (no leading slash) |
   | Name | `unicoach-backend` |

3. **Environment Variables.** Add the list below (Developer view lets you paste it all at once), then
   **untick "Build Variable" for every backend variable** (the backend needs nothing at build time, and
   build variables can show up in build logs). Generate the JWT secret on the VPS with
   `openssl rand -hex 48`. Type values **without quotes**.
   Meaning of each variable: `backend/.env.example`.

   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://unicoach_app:<APP_DB_PASSWORD>@<cluster-host>/unicoach?retryWrites=true&w=majority&appName=unicoach
   REDIS_URL=<Redis internal URL from 6.2>
   JWT_SECRET=<output of: openssl rand -hex 48>
   FRONTEND_URL=https://www.unicoach.com
   ADMIN_URL=https://admin.unicoach.com
   CORS_ORIGINS=
   GOOGLE_CLIENT_ID=<xxxx.apps.googleusercontent.com>
   RAZORPAY_KEY_ID=<rzp_test_... while testing, rzp_live_... when live>
   RAZORPAY_KEY_SECRET=<secret>
   RAZORPAY_WEBHOOK_SECRET=<same secret as the Razorpay webhook>
   RAZORPAY_ROUTE_ENABLED=false
   RESEND_API_KEY=<re_...>
   RESEND_FROM=UniCoach <bookings@booking.unicoach.com>
   RESEND_DOMAIN_VERIFIED=true
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=yourname@gmail.com
   SMTP_PASS=<16-character Gmail App Password>
   SMTP_FROM=UniCoach <yourname@gmail.com>
   CLOUDINARY_CLOUD_NAME=<cloud name>
   CLOUDINARY_API_KEY=<key>
   CLOUDINARY_API_SECRET=<secret>
   GROQ_API_KEY=<gsk_...>
   OPENAI_API_KEY=
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   SENTRY_DSN=
   HEALTH_SECRET=<optional random string>
   ```

   Replace `yourname@gmail.com` with the real Gmail address. If a value contains a `$` sign, tick
   **Literal** for that variable so Coolify does not change it.

   Rules the server enforces:
   - `JWT_SECRET` shorter than 16 characters → **the server refuses to start**.
   - `MONGO_URI` missing → the server exits.
   - `NODE_ENV` must be `production` (secure cookies, strict CORS, no payment simulator).

4. **Persistent storage for uploads.** Configuration → **Persistent Storage → + Add → Volume Mount**:
   - Name: `unicoach-uploads`
   - Destination Path: **`/app/uploads`** (the Dockerfile uses `WORKDIR /app` and the code saves to
     `<app>/uploads`, including `uploads/unicoach` for mentor resources and `uploads/temp`).

   Use a **Volume Mount**, not a Directory Mount: the app runs as user `node` (uid 1000) and a new
   volume automatically gets the right owner. If you ever use a Directory Mount instead, give it to
   uid 1000 first: `sudo chown -R 1000:1000 <host-folder>`.
   Even with Cloudinary configured this volume is required, because mentor resources are always
   stored locally.

5. **Health check.** Nothing to do: the Dockerfile has a `HEALTHCHECK` on `GET /api/health`
   (port 5000), and Coolify uses the Dockerfile check automatically. That endpoint returns 200 only when
   MongoDB is connected, so a broken release (wrong `MONGO_URI`, Atlas IP not allowed) never replaces the
   running one.

6. Click **Deploy** and watch the logs. Good signs:
   `MongoDB connected`, `Redis connected`, `Backend server running on port 5000`.

7. Test:
   ```bash
   curl -s https://api.unicoach.com/api/health
   # {"status":"UP","timestamp":"..."}
   curl -s https://api.unicoach.com/api/unicoach/health
   # "database":"CONNECTED" and "distributedLockEngine":"REDIS"
   ```

**Optional: copy old local uploads** (only if the database points to `/uploads/...` files you still have):
```powershell
# from the laptop
scp -r .\backend\uploads deploy@<VPS_IP>:/tmp/old-uploads
```
```bash
# on the VPS: find the backend container name, copy, fix owner
sudo docker ps --format '{{.Names}}' | grep -i backend
sudo docker cp /tmp/old-uploads/. <backend-container>:/app/uploads/
sudo docker exec -u root <backend-container> chown -R node:node /app/uploads
rm -rf /tmp/old-uploads
```

### 6.4 Frontend (`www.unicoach.com` + bare `unicoach.com`)

1. **+ New → Private Repository (with GitHub App)** → `Unicoach`, branch `main`.

   | Field | Value |
   |---|---|
   | Build Pack | **Dockerfile** |
   | Base Directory | `/frontend` |
   | Dockerfile Location | `/Dockerfile` |
   | Ports Exposes | `80` |
   | Domains | `https://www.unicoach.com,https://unicoach.com,https://unicoach.in,https://www.unicoach.in` |
   | Direction | **Redirect to www** (Google indexed the www host; nginx also redirects bare/`.in` hosts to www) |
   | Watch Paths | `frontend/**` |
   | Name | `unicoach-frontend` |

2. **Environment Variables** — these are **build variables** (keep **"Build Variable" ticked**):
   ```env
   VITE_API_URL=https://api.unicoach.com/api
   VITE_GOOGLE_CLIENT_ID=<same value as backend GOOGLE_CLIENT_ID>
   VITE_SENTRY_DSN=
   ```
   - The old name `VITE_API_BASE_URL` is **not read by the code**. Use `VITE_API_URL`.
   - Do **not** add `NODE_ENV` here.
   - Changing a `VITE_*` value needs a **Redeploy** (rebuild). A Restart keeps the old values.
3. **Deploy.** The first build can take 5–15 minutes (thousands of images are optimised).
4. Test `https://www.unicoach.com`, that `https://unicoach.com` redirects to it, and that an old
   WordPress URL redirects: `curl -sI https://www.unicoach.com/unicoach-ireland/` → `301` to
   `/study-abroad/ireland` (full list in `frontend/nginx.conf`).

### 6.5 Admin panel (`admin.unicoach.com`)

Same as the frontend, with:

| Field | Value |
|---|---|
| Base Directory | `/admin` |
| Dockerfile Location | `/Dockerfile` |
| Ports Exposes | `80` |
| Domains | `https://admin.unicoach.com` |
| Watch Paths | `admin/**` |
| Name | `unicoach-admin` |

Build variables ("Build Variable" ticked):
```env
VITE_API_URL=https://api.unicoach.com/api
VITE_FRONTEND_URL=https://www.unicoach.com
VITE_SENTRY_DSN=
```
(Do not also set the old `VITE_BACKEND_URL`; if both exist, the old one wins.)

### 6.6 Automatic deploys

With the GitHub App and the watch paths above, `git push origin main` redeploys **only** the app whose
folder changed.

The GitHub Actions file `.github/workflows/ci.yml` also has a "deploy" job that calls the secret
`COOLIFY_DEPLOY_WEBHOOK`. **Leave that secret unset** while Coolify auto-deploys from GitHub, otherwise
apps deploy twice. (If you later want "deploy only after CI passes", turn off auto-deploy in Coolify
and change that job to call Coolify's deploy API with an `Authorization: Bearer <Coolify API token>`
header; the current job sends no token.)

---

## 7. Post-deploy checklist

### 7.1 Razorpay
Details: `RAZORPAY_PAYMENT_SETUP_GUIDE.md` (sections 4 and 9). The production values:
- [ ] Webhook URL (Test **and** Live mode, they are separate):
      `https://api.unicoach.com/api/unicoach/webhooks/razorpay`
      Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`.
      Secret = `RAZORPAY_WEBHOOK_SECRET` of that mode.
- [ ] Delete or update the old webhook that points to `unicoach.onrender.com`; use `https://unicoach-1.onrender.com/api/unicoach/webhooks/razorpay` if using the Render backend.
- [ ] Admin → Settings: the Razorpay fields there must be **empty** (they override env).
- [ ] Start with `rzp_test_` keys, finish the test table in the Razorpay guide, then switch to live keys
      + live webhook secret and Redeploy the backend.

### 7.2 Google Sign-In
Google Cloud Console → APIs & Services → **Credentials** → your OAuth 2.0 Web client:
- [ ] **Authorized JavaScript origins:** `https://www.unicoach.com`, `https://unicoach.com`,
      `https://admin.unicoach.com` (keep `http://localhost:5173` for development).
- [ ] OAuth consent screen → Authorized domains includes `unicoach.com`.
- [ ] Remove old Vercel/Render origins after the switch. Changes can take a few minutes to apply.

### 7.3 Email
- [ ] Resend domain `booking.unicoach.com` is already **Verified** (Oct 2026). Its DNS records
      (`resend._domainkey.booking`, `send.booking` MX + SPF TXT) must stay in DNS when you change the
      web records. API key with "Sending access" → `RESEND_API_KEY`.
- [ ] `RESEND_FROM` uses the verified domain (`UniCoach <bookings@booking.unicoach.com>`).
- [ ] `RESEND_DOMAIN_VERIFIED=true` and `EMAIL_REPLY_TO=<inbox the team reads>`. All email goes through
      Resend only; SMTP is off unless `EMAIL_SMTP_FALLBACK=true` (not recommended).
- [ ] Backend logs after a test signup show `✅ [Resend] Email sent`.

### 7.4 Admin account
- [ ] Log in at `https://admin.unicoach.com` and **change the admin password** in the admin profile
      settings (16+ characters, unique).
- [ ] No admin in the database yet? Coolify → backend app → **Terminal** →
      `node scripts/seedAdmin.js --username admin --password '<strong password>'`
      (the same command also resets a forgotten admin password).

### 7.5 End-to-end tests (on the live domains)
- [ ] Sign up with email → welcome email arrives → link opens `https://www.unicoach.com/...`.
- [ ] Log in, refresh the page → still logged in (cookie works).
- [ ] Google login on `https://www.unicoach.com`.
- [ ] Forgot password → email link opens `https://www.unicoach.com`.
- [ ] Lead / counselling form → lead appears in the admin panel.
- [ ] Mentor booking with Razorpay test payment → booking CONFIRMED, both emails arrive, Razorpay
      dashboard shows the webhook delivered with **200**.
- [ ] Admin: upload a blog image → URL is a Cloudinary URL.
- [ ] Mentor resource upload → **Redeploy the backend** → the file still opens (volume works).
- [ ] One AI tool (e.g. SOP generator) answers.
- [ ] `curl -sI https://www.unicoach.com` shows `x-content-type-options`, `referrer-policy`,
      `x-frame-options`; `https://api.unicoach.com/api/health` shows only `status` and `timestamp`.

### 7.6 Monitoring (UptimeRobot, free)
Create monitors with 5-minute interval and email + mobile-app alerts:
- [ ] `https://www.unicoach.com` (HTTP(s))
- [ ] `https://admin.unicoach.com` (HTTP(s))
- [ ] `https://api.unicoach.com/api/health` (Keyword monitor, keyword `UP`; or HTTP(s) — it returns
      503 when the database is down)
- [ ] Optional: `https://coolify.unicoach.com`

### 7.7 Switch off the old hosting
- [ ] After 1–2 calm weeks, suspend/delete the old Render backend and Vercel projects. The old backend
      still runs scheduled jobs and could send duplicate emails.
- [ ] Take a **Hostinger snapshot** (hPanel → VPS → Snapshots) once everything works.

### 7.8 Google: keep the old rankings (do this on launch day)
The old WordPress site is indexed as `https://www.unicoach.com/...` (70 pages, 36 posts). The new site
keeps that ranking because every old URL now answers with a **301** to the closest new page
(`frontend/nginx.conf`), the main host stays `www`, and every page carries a canonical URL on
`https://www.unicoach.com`.

- [ ] Spot-check redirects after DNS switches:
      `curl -sI https://www.unicoach.com/unicoach-ireland/` → `301` `location: /study-abroad/ireland`;
      `curl -sI https://www.unicoach.com/careers/` → `/contact`;
      `curl -sI https://unicoach.com/` → `https://www.unicoach.com/`.
- [ ] `https://www.unicoach.com/sitemap.xml` lists the new pages (it is regenerated on every build) and
      `https://www.unicoach.com/robots.txt` points to it.
- [ ] **Google Search Console** (search.google.com/search-console): use the existing `unicoach.com`
      property if the old site was verified, otherwise **Add property → Domain → `unicoach.com`** and add
      the TXT record it shows in Bluehost DNS.
- [ ] Search Console → **Sitemaps**: remove the old WordPress sitemaps (`post-sitemap.xml`,
      `page-sitemap.xml`, …) and submit `https://www.unicoach.com/sitemap.xml`.
- [ ] Search Console → **URL inspection** → `https://www.unicoach.com/` → **Request indexing**. Repeat for
      `/universities`, `/study-abroad`, `/contact`, `/unicoach`.
- [ ] Do **not** use the "Change of address" tool (the domain is not changing).
- [ ] What to expect: the new title/description shows within days; the favicon and sitelinks (the indented
      links under the result) are chosen automatically by Google and update over 1–4 weeks. A small
      ranking wobble in the first weeks is normal. Check Search Console → **Pages** for 404s every few
      days and add a redirect in `nginx.conf` for any old URL still getting traffic.

---

## 8. Backups

| What | Where | How often | Kept |
|---|---|---|---|
| Database | Atlas automatic snapshot (Flex) | daily | Atlas default (see Backup tab) |
| Database + uploads volume | Cloudflare R2 (our script) | daily 03:00 IST | 30 days |
| Coolify secrets | your password manager (step 3.3) | once | — |
| App env variables | password manager (copy from Coolify Developer view) | after each change | — |

### 8.1 Atlas snapshots
Atlas → cluster → **Backup**: confirm daily snapshots appear. Restore = "Restore" on a snapshot.

### 8.2 R2 bucket and key
1. Cloudflare → **R2** → Create bucket `unicoach-backups` (location hint: Asia-Pacific). Keep it private.
2. Bucket → Settings → **Object lifecycle rules** → add rule: prefix `daily/`, delete after **30 days**.
3. R2 → **Manage API tokens → Create API token**: permission **Object Read & Write**, only bucket
   `unicoach-backups`. Copy the **Access Key ID**, **Secret Access Key** and the S3 endpoint
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

### 8.3 Install rclone and connect R2 (on the VPS)
```bash
sudo apt install -y rclone
sudo mkdir -p /root/.config/rclone
sudo tee /root/.config/rclone/rclone.conf > /dev/null <<'EOF'
[r2]
type = s3
provider = Cloudflare
access_key_id = <R2_ACCESS_KEY_ID>
secret_access_key = <R2_SECRET_ACCESS_KEY>
endpoint = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
EOF
sudo chmod 600 /root/.config/rclone/rclone.conf
sudo rclone lsf r2:unicoach-backups && echo "R2 OK"
```

### 8.4 The backup script

Find the uploads volume name:
```bash
sudo docker volume ls | grep -i upload
```

Settings file (only root can read it):
```bash
sudo mkdir -p /opt/unicoach-backup
sudo tee /opt/unicoach-backup/backup.env > /dev/null <<'EOF'
# Atlas READ-ONLY backup user, no database name in the path
MONGO_BACKUP_URI='mongodb+srv://unicoach_backup:<BACKUP_DB_PASSWORD>@<cluster-host>/?retryWrites=true&w=majority'
# Docker volume mounted on /app/uploads (from: sudo docker volume ls | grep -i upload)
UPLOADS_VOLUME='<uploads-volume-name>'
# rclone remote:bucket/folder
R2_TARGET='r2:unicoach-backups/daily'
# local copies to keep on the VPS (days)
KEEP_LOCAL_DAYS=3
# optional: ping URL from https://healthchecks.io (emails you if a backup does not run)
HEARTBEAT_URL=''
EOF
sudo chmod 600 /opt/unicoach-backup/backup.env
```

Script:
```bash
sudo tee /opt/unicoach-backup/backup.sh > /dev/null <<'EOF'
#!/usr/bin/env bash
# UniCoach daily backup: MongoDB "unicoach" database + uploads volume -> Cloudflare R2
set -euo pipefail

set -a; source /opt/unicoach-backup/backup.env; set +a

STAMP="$(date -u +%Y-%m-%d_%H%M)"
WORK="/var/backups/unicoach"
mkdir -p "$WORK" && chmod 700 "$WORK"
echo "[$(date -u)] backup $STAMP started"

# 1) MongoDB dump (one compressed archive). The URI goes in as an env var, not on the command line.
docker run --rm -e MONGO_BACKUP_URI mongo:8.0 \
  sh -c 'mongodump --uri="$MONGO_BACKUP_URI" --db=unicoach --gzip --archive' \
  > "$WORK/mongo_$STAMP.archive.gz"

# 2) Uploads volume, mounted read-only
docker run --rm -v "$UPLOADS_VOLUME":/data:ro alpine:3 \
  tar -czf - -C /data . > "$WORK/uploads_$STAMP.tar.gz"

# 3) Sanity checks before uploading
[ "$(stat -c %s "$WORK/mongo_$STAMP.archive.gz")" -gt 1000 ] || { echo "mongo dump too small"; exit 1; }
gzip -t "$WORK/uploads_$STAMP.tar.gz"

# 4) Upload today's files to R2 (R2 lifecycle rule deletes them after 30 days)
rclone copy "$WORK" "$R2_TARGET" --include "*_$STAMP.*"

# 5) Keep only a few days on the VPS disk
find "$WORK" -type f -name '*_*' -mtime +"${KEEP_LOCAL_DAYS:-3}" -delete

# 6) Optional heartbeat
if [ -n "${HEARTBEAT_URL:-}" ]; then curl -fsS -m 10 --retry 3 "$HEARTBEAT_URL" > /dev/null; fi

echo "[$(date -u)] backup $STAMP finished OK"
EOF
sudo chmod 700 /opt/unicoach-backup/backup.sh
```

Run it once by hand and check R2:
```bash
sudo /opt/unicoach-backup/backup.sh
sudo rclone ls r2:unicoach-backups/daily
```

Schedule it every day at 21:30 UTC (= 03:00 IST):
```bash
echo '30 21 * * * root /opt/unicoach-backup/backup.sh >> /var/log/unicoach-backup.log 2>&1' | sudo tee /etc/cron.d/unicoach-backup
sudo chmod 644 /etc/cron.d/unicoach-backup
```
Check next day: `sudo tail -n 20 /var/log/unicoach-backup.log`.

> Why cron and not a Coolify Scheduled Task? Coolify scheduled tasks run **inside** an app container,
> and the backend image (correctly) has no `mongodump`/`rclone`. A host cron job with the official
> `mongo` image is simpler and keeps the app image small. (`npm run backup` / `scripts/backupDb.js`
> only exports a few collections to JSON, so it is **not** a full backup.)

### 8.5 Restore test (do it once now, then every month)
Restores the latest dump into a **throwaway** local MongoDB container (no ports opened) and counts
documents. Production is not touched.
```bash
LATEST=$(sudo rclone lsf r2:unicoach-backups/daily --include 'mongo_*' | sort | tail -n 1); echo "$LATEST"
sudo rm -rf /tmp/restore-test && sudo mkdir -p /tmp/restore-test
sudo rclone copy "r2:unicoach-backups/daily/$LATEST" /tmp/restore-test/
sudo docker run -d --name restore-test mongo:8.0
sleep 15
sudo docker cp "/tmp/restore-test/$LATEST" restore-test:/tmp/dump.archive.gz
sudo docker exec restore-test mongorestore --gzip --archive=/tmp/dump.archive.gz
sudo docker exec restore-test mongosh --quiet --eval '
  const d = db.getSiblingDB("unicoach");
  d.getCollectionNames().sort().forEach(c => print(c + "  docs=" + d.getCollection(c).countDocuments({})));'
sudo docker rm -f restore-test && sudo rm -rf /tmp/restore-test
```
Compare the numbers with production (run `count.js` from step 4.6 with the backup user URI).
Uploads archive check: `sudo tar -tzf "$(ls -t /var/backups/unicoach/uploads_* | head -1)" | head`.

### 8.6 Real disaster restore
First download the files you need from R2 (`sudo rclone ls r2:unicoach-backups/daily` lists them):
```bash
sudo mkdir -p /tmp/restore
sudo rclone copy r2:unicoach-backups/daily/<mongo_file>.archive.gz /tmp/restore/
sudo rclone copy r2:unicoach-backups/daily/<uploads_file>.tar.gz /tmp/restore/
```
- **Database:** easiest is Atlas → Backup → Restore a snapshot. Or restore our R2 archive
  (uses the `unicoach_app` user; `--drop` overwrites current data, so be sure):
  ```bash
  sudo docker run --rm -v /tmp/restore:/backup mongo:8.0 \
    mongorestore --uri='mongodb+srv://unicoach_app:<APP_DB_PASSWORD>@<cluster-host>/' \
    --nsInclude='unicoach.*' --drop --gzip --archive=/backup/<mongo_file>.archive.gz
  ```
- **Uploads:** stop the backend in Coolify, then:
  ```bash
  sudo docker run --rm -v <uploads-volume-name>:/data -v /tmp/restore:/backup alpine:3 \
    sh -c 'tar -xzf /backup/<uploads_file>.tar.gz -C /data && chown -R 1000:1000 /data'
  ```
  Start the backend again.
- **Whole server lost:** new VPS → sections 2, 3 (restore Coolify or recreate the apps from this guide
  and your saved env variables) → restore uploads → point DNS to the new IP.

---

## 9. Updating, redeploying and rolling back

**Normal update:** `git push origin main`. Coolify builds only the changed app, starts the new
container, waits for its health check, then switches traffic and removes the old one (no downtime).
Follow it in Coolify → app → **Deployments** (logs).

| I want to… | Do this in Coolify |
|---|---|
| Deploy the latest commit again | app → **Redeploy** |
| Fix a strange build / dependency problem | app → **Force deploy (without cache)** |
| Apply a changed **backend** env variable | change it → **Redeploy** (or Restart) |
| Apply a changed **VITE_*** variable (frontend/admin) | change it → **Redeploy** (must rebuild) |
| Go back to the previous version | app → Configuration → **Rollback** → pick an older image → Rollback |
| See logs | app → **Logs** (or `sudo docker logs --tail 200 <container>`) |

Rollback notes:
- Rollback uses an older **image** with the **current** env variables. It does not undo database
  changes and does not restore files.
- Coolify keeps a few old images for rollback; the daily Docker cleanup does not remove them.
- Code-level alternative: `git revert <commit> && git push origin main`.

Maintenance:
- Monthly: apply the reboot check from 2.6, look at disk space (`df -h`, `sudo docker system df`),
  and do the restore test from 8.5.
- **Node.js 22 reaches end-of-life in April 2027.** Before that, change `FROM node:22-alpine` to
  `FROM node:24-alpine` in the three Dockerfiles, test locally, and deploy.
- Take a Hostinger snapshot before big changes (Coolify upgrade, OS upgrade).

---

## 10. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Browser console: **"blocked by CORS policy"** | Site opened from a domain the API does not allow: typo in `FRONTEND_URL` / `ADMIN_URL`, `http://` instead of `https://`, or a new domain. A crashing backend (5xx) can also look like a CORS error. | Check backend env (all `https://`, no typos). Add extra exact domains to `CORS_ORIGINS` (comma separated). Redeploy backend. Check backend logs for errors. |
| **502 Bad Gateway**, "no available server" or Traefik "404 page not found" | Container not running/unhealthy, or wrong **Ports Exposes** (backend `5000`, frontend/admin `80`). Backend is "unhealthy" while MongoDB is unreachable, because `/api/health` returns 503. | Coolify → app → Logs. Check Ports Exposes and that `PORT=5000`. If logs show MongoDB errors: Atlas Network Access must contain `<VPS_IP>`, password must be right. |
| Backend keeps restarting: **"JWT_SECRET is missing or too short (min 16 chars)"** | `JWT_SECRET` missing, short, or only set as a build variable | Set it (use `openssl rand -hex 48`), make sure it is a **runtime** variable, Redeploy. |
| **"FATAL: MONGO_URI environment variable is not defined"** | Variable missing or build-only | Add `MONGO_URI` as runtime variable, Redeploy. |
| MongoDB **"bad auth : authentication failed"** | Wrong user/password, or special characters not URL-encoded | Reset the Atlas user password with letters/digits only, update `MONGO_URI`. |
| MongoDB **server selection timed out** | VPS IP not in Atlas Network Access | Atlas → Network Access → add `<VPS_IP>/32`. |
| **Logged out after refresh / cookies not set** | Not HTTPS, `NODE_ENV` not `production`, site opened from a domain other than `unicoach.com` / `unicoach.in` (browser blocks the cookie as third-party), or the frontend was built with a wrong `VITE_API_URL` | Use only the `https://*.unicoach.in` domains. Check the build variable `VITE_API_URL=https://api.unicoach.com/api` and Redeploy the frontend. |
| Site calls **unicoach.onrender.com** | `VITE_API_URL` was not a **build** variable at build time | Set `VITE_API_URL=https://unicoach-1.onrender.com/api` as a build variable, then redeploy frontend/admin. |
| Google login: **"origin is not allowed for the client ID"** | Missing Authorized JavaScript origin | Add the exact origin (7.2), wait a few minutes. |
| Emails not arriving | Resend domain not verified, `RESEND_FROM` not on the verified domain `booking.unicoach.com`, wrong Gmail App Password | Backend logs show `[Resend]` / `[SMTP]` lines with the reason. Fix 7.3. |
| Razorpay webhook shows **400** | Webhook secret mismatch (test vs live) | See `RAZORPAY_PAYMENT_SETUP_GUIDE.md` section 11. |
| Browser warns about certificate / "TRAEFIK DEFAULT CERT" | DNS not pointing to the VPS yet, Cloudflare proxy turned on too early, or port 80 blocked | Records **DNS only**, port 80 open in Hostinger firewall, wait, then Coolify → Servers → Proxy → Restart. |
| **ERR_TOO_MANY_REDIRECTS** | Cloudflare SSL mode "Flexible" | Set **Full (strict)**. |
| Many users get **"Too many requests"** | Cloudflare proxy on `api` (everyone shares Cloudflare's IP) | Set `api` record to **DNS only**. |
| Uploaded files **disappear after a deploy** | No volume on `/app/uploads` | Add the Volume Mount (6.3 step 4), Redeploy. Lost files cannot come back except from backups. |
| **EACCES: permission denied** on `/app/uploads` | Directory mount owned by root | Use a Volume Mount, or `sudo chown -R 1000:1000 <host-folder>`. |
| Build fails: **"JavaScript heap out of memory"** or exit code **137** | Not enough RAM during the frontend build | Make sure swap exists (2.4); deploy at low-traffic time. |
| New version not visible | Old page cached (Cloudflare proxy) or old tab | Hard refresh (Ctrl+F5); Cloudflare → Purge cache. index.html is sent with `no-cache`, so normally it updates at once. |
| Disk almost full | Old images / build cache | Coolify → Servers → Docker cleanup → run now; `sudo docker system df`. |
| Coolify dashboard unreachable | Instance domain DNS wrong, or proxy stopped | Temporarily allow TCP 8000 in the Hostinger firewall, open `http://<VPS_IP>:8000`, fix, close it again. |

Useful commands on the VPS:
```bash
sudo docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'   # containers + health
sudo docker logs --tail 200 <container>                               # logs of one container
sudo docker inspect --format '{{json .State.Health}}' <container>     # health check details
df -h && free -h                                                     # disk and memory
```
