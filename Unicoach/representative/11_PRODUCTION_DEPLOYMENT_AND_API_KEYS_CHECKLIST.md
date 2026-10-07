# 🚀 Feature 11: Production Deployment & API Keys Handover Checklist

---

## 📌 1. Purpose of this Document
Jab aap is platform ko **Production (Live Client/Boss Server)** par deploy karenge, toh personal test keys ki jagah company ke official paid accounts integrate karne honge.

Yaha sabhi required API keys, accounts aur environment variables ki complete list hai:

---

## 🔑 2. Required Production API Keys & Services

| Service Name | Purpose in UniCoach | Kahan se Lena Hai | Env Variable Name in `.env` |
| :--- | :--- | :--- | :--- |
| **Groq Cloud AI** (Recommended) | High-speed AI Explainer, Lead Scoring, IELTS Grader, SOP Generator | [console.groq.com](https://console.groq.com) | `GROQ_API_KEY` |
| **MongoDB Atlas** | Production Database (Universities, Leads, Blogs, Users) | [mongodb.com/atlas](https://www.mongodb.com/atlas) | `MONGO_URI` |
| **Twilio SMS / WhatsApp** | Student phone verification OTP & transactional SMS | [twilio.com/console](https://www.twilio.com/console) | `TWILIO_ACCOUNT_SID`<br>`TWILIO_AUTH_TOKEN`<br>`TWILIO_PHONE_NUMBER` |
| **SMTP Mail Server** | Student welcome emails, counselor follow-ups, password resets | Google Workspace SMTP / SendGrid / AWS SES | `SMTP_HOST`<br>`SMTP_PORT`<br>`SMTP_USER`<br>`SMTP_PASS`<br>`SMTP_FROM` |
| **JWT Secret Key** | Admin & User authentication security token | Generate 64-char random string | `JWT_SECRET` |
| **SerpAPI** (Optional) | Live Google ranking search & scholarship discovery fallback | [serpapi.com](https://serpapi.com) | `SERPAPI_API_KEY` |

---

## 📄 3. Production `.env` Template (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://unicoach.com
ADMIN_URL=https://admin.unicoach.com

# Database Connection (MongoDB Atlas Cluster with connection pooling)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/unicoach_prod?retryWrites=true&w=majority&maxPoolSize=100

# Authentication Security
JWT_SECRET=super_secure_random_64_character_production_secret_key_here
JWT_EXPIRES_IN=7d

# Groq AI Cloud Engine
GROQ_API_KEY=gsk_your_production_paid_groq_api_key_here

# Twilio OTP & SMS Gateway
TWILIO_ACCOUNT_SID=AC_your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SMTP Email Gateway (SendGrid / AWS SES / Google Workspace)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_production_key_here
SMTP_FROM="UniCoach Admissions" <admissions@unicoach.com>

# Rate Limiting & Uploads
UPLOAD_PATH=uploads/
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

---

## 🏗️ 4. Build & Production Deployment Commands

### Backend:
```bash
cd backend
npm install --production
node server.js # (Use PM2: pm2 start server.js --name "unicoach-backend")
```

### Frontend (Student Portal):
```bash
cd frontend
npm install
npm run build # Generates optimized 'dist' folder
```

### Admin (Counselor CRM):
```bash
cd admin
npm install
npm run build # Generates optimized 'dist' folder
```

---

## 🛡️ 5. Pre-Launch Security Checklist
- [x] CORS allowed origins configured to exact production domains.
- [x] Rate limiting active on OTP and login routes to prevent brute-force attacks.
- [x] Passwords hashed with bcrypt (salt rounds: 10).
- [x] SessionStorage caching enabled for zero latency on repetitive AI reads.
- [x] Heuristic AI fallbacks in place to guarantee zero downtime during API rate limits.
