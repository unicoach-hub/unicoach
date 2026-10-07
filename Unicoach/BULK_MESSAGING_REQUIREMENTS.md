# Bulk Messaging Setup & Requirements Guide

This document outlines the detailed requirements, service provider options, and configuration steps to enable **Bulk Email** and **Bulk WhatsApp** messaging inside the Unicoach CRM.

---

## 1. Bulk Email Requirements

Production bulk email systems require high-deliverability servers to prevent emails from landing in the spam folder.

### Recommended Providers (Production & Scale)

#### Option A: Amazon SES (Simple Email Service) - *Best for Cost & Scale*
* **Estimated Cost**: ~$0.10 per 1,000 emails (extremely cheap).
* **Setup Steps**:
  1. Create an AWS Account.
  2. Search for **Amazon SES** in the AWS Console.
  3. Verify your domain (e.g., `unicoach.in`) by adding TXT/CNAME records to your DNS provider (GoDaddy, Hostinger, Cloudflare).
  4. Move out of "SES Sandbox Mode" by submitting a quick request specifying your sending use-case.
  5. Go to **SMTP Settings** in AWS SES and click **Create SMTP Credentials**.
  6. Copy the SMTP Server, Port, Username, and Password.

#### Option B: Twilio SendGrid - *Best for Analytics & Ease of Setup*
* **Estimated Cost**: Free tier (100 emails/day), then plans start from ~$20/month.
* **Setup Steps**:
  1. Register on [SendGrid.com](https://sendgrid.com/).
  2. Go to **Settings > Sender Authentication** and verify your domain.
  3. Go to **Email API > Integration Guide > SMTP**.
  4. Generate an API Key (this will be your SMTP password).

#### Option C: Brevo (formerly Sendinblue) - *Best Free Tier to Start*
* **Estimated Cost**: Free up to 300 emails/day.
* **Setup Steps**:
  1. Register on [Brevo.com](https://www.brevo.com/).
  2. Go to the top right menu, select **SMTP & API**.
  3. Under the **SMTP** tab, copy the Server, Port, Login, and generate a password/key.

### Environment Configuration (`backend/.env`)

Add the following variables to your backend configuration once you choose a provider:

```env
# Email SMTP Settings
SMTP_HOST=your-smtp-host (e.g., smtp.gmail.com or smtp.sendgrid.net)
SMTP_PORT=587
SMTP_USER=your-smtp-username-or-login
SMTP_PASS=your-smtp-password-or-api-key
SMTP_FROM="Unicoach Support" <no-reply@unicoach.in>
```

---

## 2. Bulk WhatsApp Requirements

Meta has strict anti-spam rules. For automated bulk messages, you must use official business APIs to prevent your phone number from getting banned.

### Service Provider Options

#### Option A: Twilio WhatsApp Business API (Recommended)
* **Estimated Cost**: Meta official rates + Twilio fee (approx ₹0.30 to ₹0.50 per conversation in India).
* **Setup Steps**:
  1. Create or log into your [Twilio.com](https://www.twilio.com) account.
  2. Copy your **Account SID** and **Auth Token** from the dashboard.
  3. Set up the Twilio WhatsApp Sandbox for developer testing under **Develop > Messaging > Try it out > Send a WhatsApp message**.
  4. For production, go to **Messaging > Senders > WhatsApp Senders** and connect your business number (requires Facebook Business Manager verification).
  5. Create and submit message templates (e.g., `welcome_template`) for approval in the Twilio / Meta console.

#### Option B: Direct Meta Cloud API
* **Estimated Cost**: Meta conversation fees only (approx ₹0.30 to ₹0.40 per conversation, saving middleman charges).
* **Setup Steps**:
  1. Create a Meta Developer account at [developers.facebook.com](https://developers.facebook.com/).
  2. Create a Business App and add the **WhatsApp** product.
  3. Configure your phone number and obtain a **Permanent Access Token** and **Phone Number ID**.

### Environment Configuration (`backend/.env`)

```env
# Twilio WhatsApp/SMS Settings
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_sms_phone_number (for SMS OTP)
TWILIO_WHATSAPP_NUMBER=whatsapp:your_approved_twilio_whatsapp_number (e.g. whatsapp:+14155238886 for Sandbox)
```

---

## 3. Development / Simulator Mode (No Credentials Needed)

To review and build the user interface before setting up production accounts, the backend includes a simulator fallback:
* **Emails**: If SMTP configuration is missing, emails are logged directly to the backend terminal window with all dynamic variables replaced.
* **WhatsApp**: If Twilio is not configured, WhatsApp logs are printed directly to the backend terminal window.

---
*Created on 2026-07-07. Save this file for reference when configuring messaging services in production.*
