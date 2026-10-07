# UniCoach Full-Stack Setup & Configuration Guide

This guide lists all the required credentials, API keys, database settings, and environmental variables needed to connect and run the Backend, Public Frontend, and Standalone Admin Panel.

---

## 🛠️ Required API Keys & Configurations

To run the complete system with OTP login, data storage, and dynamic dashboard content, you need to collect and set up the following:

### 1. Database (MongoDB)
* **`MONGO_URI`**: The connection string to your MongoDB database.
  * *Option A (Development)*: `mongodb://127.0.0.1:27017/unicoach` (Requires MongoDB installed locally).
  * *Option B (Cloud/Production)*: MongoDB Atlas connection string (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/unicoach`).

### 2. SMS Gateway (Twilio Account)
Sign up on [Twilio](https://www.twilio.com/) (you can start with a free trial account) to get these credentials for sending OTPs via SMS:
* **`TWILIO_ACCOUNT_SID`**: Found in your Twilio Console dashboard.
* **`TWILIO_AUTH_TOKEN`**: Found in your Twilio Console dashboard (keep this secret).
* **`TWILIO_PHONE_NUMBER`**: The virtual phone number provided by Twilio to send SMS messages (must include country code, e.g., `+18559090623`).

### 3. Security (JSON Web Tokens)
* **`JWT_SECRET`**: A strong, random string used to sign backend tokens for user and admin authentication. Keep this secure (e.g., `supersecrettokenkeys123!`).

---

## 📁 Environment Configuration Files (`.env`)

You need to create/update the `.env` files in the respective project directories:

### A. Backend Configuration
Create a file named `.env` in `c:/unicoach/backend/.env`:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/unicoach

# JWT Authentication Secret
JWT_SECRET=your_jwt_signing_secret_here

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### B. Admin Panel Configuration
Create a file named `.env` in `c:/unicoach/admin/.env`:

```env
# Backend API URL endpoint
VITE_API_URL=http://localhost:5000/api
```

### C. Public Frontend Configuration
Create a file named `.env` in `c:/unicoach/frontend/.env`:

```env
# Backend API URL endpoint
VITE_API_URL=http://localhost:5000/api
```

---

## 🧑‍💻 How to Run the Applications

Open three separate terminals and run the following commands:

### 1. Start the Backend Server
```bash
cd c:/unicoach/backend
npm run dev
```
*(Runs on `http://localhost:5000`)*

### 2. Start the Standalone Admin Panel
```bash
cd c:/unicoach/admin
npm run dev
```
*(Runs on `http://localhost:5173` or similar free port)*

### 3. Start the Public Frontend App
```bash
cd c:/unicoach/frontend
npm run dev
```
*(Runs on your frontend dev port)*

---

## 🔑 Initial Admin Account Setup
Because registration is OTP-secured, you need a way to log in as an administrator for the first time. We will provide a simple command-line script to add your phone number directly to the database as an `admin`.
