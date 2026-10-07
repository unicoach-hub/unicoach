> ⚠️ **OUTDATED (Oct 2026).** Use [PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md](PRODUCTION_DEPLOYMENT_COOLIFY_GUIDE.md) instead. This file has old domains, settings and security advice.

# 🖥️ Hostinger VPS & MongoDB Atlas: Step-by-Step Setup Guide

This guide takes you through the step-by-step process of setting up your MongoDB Atlas database, configuring a fresh Hostinger Ubuntu VPS, and deploying your Backend API.

---

## 💾 Part 1: MongoDB Atlas Database Setup

Follow these steps to set up your cloud database and get your connection string:

1. **Sign Up / Login:**
   * Go to [mongodbcom/atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Create a Cluster:**
   * Click **Create a Database**.
   
   * Select your tier (e.g., **M0 Free** for testing or **M10/M20** Dedicated for production).
   * Choose a cloud provider (Recommended: **AWS**) and select a region close to your target audience (e.g., **ap-south-1** Mumbai for India).
   * Click **Create**.
3. **Set Up Security (Database User):**
   * Go to **Database Access** (left sidebar) ➔ Click **Add New Database User**.
   * Set authentication method to **Password**.
   * Create a username (e.g., `db_user`) and a strong password. Note these down.
   * Under Database User Privileges, select **Read and write to any database**.
4. **Configure Network Access (Whitelisting IP):**
   * Go to **Network Access** (left sidebar) ➔ Click **Add IP Address**.
   * Click **Allow Access from Anywhere** (adds `0.0.0.0/0`). This is necessary so your Hostinger VPS and Vercel services can connect to the database.
   * Click **Confirm**.
5. **Get Connection String:**
   * Go to **Database** (left sidebar) ➔ Click **Connect** on your cluster.
   * Select **Drivers** (Node.js).
   * Copy the connection string. It will look like this:
     `mongodb+srv://db_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   * Replace `<password>` with the password you created in step 3. This is your `MONGO_URI`.

---

## 🐧 Part 2: Hostinger VPS Setup (Ubuntu 22.04 LTS)

After purchasing your VPS from Hostinger, follow these steps to install the backend server components:

### 1. Select the OS
* In your Hostinger dashboard, choose **Ubuntu 22.04 LTS** as the operating system for your KVM VPS.

### 2. Login to the VPS via Terminal
* Open your computer's terminal (or PowerShell on Windows) and run:
  ```bash
  ssh root@your_vps_ip_address
  ```
* Enter your root password when prompted.

### 3. Update the Server Packages
Run these commands to update your Linux environment:
```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Node.js (v20+)
Install NodeSource to download the latest LTS version of Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
Verify the installation:
```bash
node -v
npm -v
```

### 5. Install PM2 (Process Manager)
PM2 keeps your Node.js application running in the background and restarts it automatically if the server crashes or reboots.
```bash
sudo npm install -g pm2
```

### 6. Install Nginx (Web Server)
Nginx acts as a reverse proxy, routing traffic from port `80` (HTTP) and `444` (HTTPS) to your Node.js app running on port `5000`.
```bash
sudo apt install nginx -y
```

---

## 🚀 Part 3: Deploying & Running the Backend API

### 1. Copy your Backend Code to the VPS
You can use Git to clone your code directly onto the VPS:
```bash
cd /var/www
git clone <your_github_repo_url>
cd <your_project_folder>/backend
```
Install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create the `.env` file on the server:
```bash
nano .env
```
Paste your production settings (replace with your real credentials):
```env
PORT=5000
MONGO_URI=mongodb+srv://db_user:YOUR_SECRET_PASSWORD@cluster0.xxxxx.mongodb.net/unicoach?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret
TWILIO_ACCOUNT_SID=your_real_twilio_sid
TWILIO_AUTH_TOKEN=your_real_twilio_token
TWILIO_PHONE_NUMBER=your_real_twilio_phone_number
```
*Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit the nano editor.*

### 3. Run the App with PM2
Start your backend server:
```bash
pm2 start server.js --name "unicoach-backend"
```
Configure PM2 to start your app automatically when the VPS reboots:
```bash
pm2 startup systemd
# Copy and run the command printed by the command above, then save:
pm2 save
```

---

## 🔒 Part 4: Configure Nginx & Setup Free SSL (HTTPS)

### 1. Configure Nginx Reverse Proxy
Open the default Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the content of the file with the following setup (replace `api.yourdomain.com` with your actual subdomain/domain):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Save and close the file, then restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Install Let's Encrypt SSL
Install Certbot to set up a free SSL certificate for secure HTTPS:
```bash
sudo apt install certbot python3-certbot-nginx -y
```
Run Certbot to fetch and configure the SSL certificate:
```bash
sudo certbot --nginx -d api.yourdomain.com
```
*Follow the on-screen prompts (enter your email, agree to terms). Certbot will automatically rewrite the Nginx configuration to enable HTTPS.*
<!-- get your query in minutes 
meet real peoples with real experinces  -->