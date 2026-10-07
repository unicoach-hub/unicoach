const crypto = require('crypto');
const Razorpay = require('razorpay');
const Settings = require('../../models/Settings');

/**
 * Dynamically resolves payment gateway credentials from DB Settings or process.env
 */
async function getPaymentConfig() {
  let dbConfig = null;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      dbConfig = await Settings.findOne();
    }
  } catch (err) {
    console.warn('[PaymentService] Could not read Settings from DB:', err.message);
  }

  const razorpayKeyId = dbConfig?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '';
  const razorpayKeySecret = dbConfig?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '';
  const razorpayWebhookSecret = dbConfig?.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const paypalClientId = dbConfig?.paypalClientId || process.env.PAYPAL_CLIENT_ID || '';
  const paypalClientSecret = dbConfig?.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || '';
  const paypalMode = dbConfig?.paypalMode || process.env.PAYPAL_MODE || 'sandbox';

  const isRazorpayConfigured = Boolean(
    razorpayKeyId && 
    razorpayKeySecret && 
    !razorpayKeyId.includes('sample') && 
    !razorpayKeySecret.includes('sample')
  );

  const isPayPalConfigured = Boolean(
    paypalClientId && 
    paypalClientSecret && 
    !paypalClientId.includes('sample') && 
    !paypalClientSecret.includes('sample')
  );

  return {
    razorpay: {
      keyId: razorpayKeyId,
      keySecret: razorpayKeySecret,
      webhookSecret: razorpayWebhookSecret,
      isConfigured: isRazorpayConfigured
    },
    paypal: {
      clientId: paypalClientId,
      clientSecret: paypalClientSecret,
      mode: paypalMode,
      isConfigured: isPayPalConfigured
    }
  };
}

/**
 * ─────────────────────────────────────────────────────────────
 * RAZORPAY: Create Order
 * ─────────────────────────────────────────────────────────────
 */
async function createRazorpayOrder({ amountINR, bookingRef, notes = {} }) {
  const config = await getPaymentConfig();
  const amountInPaise = Math.round(Number(amountINR) * 100);

  if (!config.razorpay.isConfigured) {
    if (!isSimulationAllowed(config)) {
      throw new Error('Online payments are not configured yet. Please try again later.');
    }
    // Zero-Blocker Simulation Mode (local development only)
    console.log(`\x1b[33m[PAYMENT SIMULATOR] Creating simulated Razorpay order for ₹${amountINR} (Ref: ${bookingRef})\x1b[0m`);
    return {
      gateway: 'RAZORPAY',
      orderId: `order_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amount: amountInPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId || 'rzp_test_simulated_key',
      simulated: true
    };
  }

  try {
    const instance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: bookingRef,
      notes: {
        ...notes,
        bookingRef,
        // Lets the team filter UniCoach payments in a Razorpay dashboard shared with other businesses
        platform: 'unicoach'
      }
    };

    const order = await instance.orders.create(options);
    console.log(`✅ [PaymentService] Razorpay Live Order Created: ${order.id} for ref ${bookingRef}`);
    return {
      gateway: 'RAZORPAY',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpay.keyId,
      simulated: false
    };
  } catch (err) {
    console.error('❌ [PaymentService] Razorpay Order Creation Error:', err);
    throw new Error(err.error?.description || err.message || 'Failed to create Razorpay order');
  }
}

/**
 * Simulation (fake orders/payments) is only allowed outside production, and only while
 * real Razorpay keys are not configured. It can never be triggered by client input.
 */
function isSimulationAllowed(config) {
  return process.env.NODE_ENV !== 'production' && !config.razorpay.isConfigured;
}

async function getRazorpayInstance() {
  const config = await getPaymentConfig();
  if (!config.razorpay.isConfigured) return null;
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret
  });
}

function safeEqualHex(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/**
 * ─────────────────────────────────────────────────────────────
 * RAZORPAY: Verify a checkout payment against the order WE created
 * ─────────────────────────────────────────────────────────────
 * - orderId must be the one stored on the booking (never trust the client's order id)
 * - HMAC signature check (timing-safe)
 * - Fetch the payment from Razorpay and confirm order, amount and status
 * - Capture it if it is only authorized
 * Returns { verified, simulated, payment } where payment is the Razorpay payment entity.
 */
async function verifyRazorpayPayment({ orderId, paymentId, signature, expectedAmountINR }) {
  const config = await getPaymentConfig();

  if (!orderId) {
    return { verified: false, error: 'No Razorpay order exists for this booking.' };
  }

  if (orderId.startsWith('order_sim_')) {
    if (!isSimulationAllowed(config)) {
      return { verified: false, error: 'Simulated payments are disabled.' };
    }
    console.log(`[33m[PAYMENT SIMULATOR] Verified simulated Razorpay payment for order ${orderId}[0m`);
    return { verified: true, simulated: true, payment: null };
  }

  if (!config.razorpay.isConfigured) {
    return { verified: false, error: 'Razorpay is not configured on the server.' };
  }

  if (!paymentId || !signature) {
    return { verified: false, error: 'Missing Razorpay payment id or signature.' };
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (!safeEqualHex(expectedSignature, signature)) {
    console.warn(`❌ [PaymentService] Invalid Razorpay signature for order ${orderId}`);
    return { verified: false, error: 'Payment signature verification failed.' };
  }

  try {
    const instance = await getRazorpayInstance();
    let payment = await instance.payments.fetch(paymentId);
    const expectedPaise = Math.round(Number(expectedAmountINR) * 100);

    if (payment.order_id !== orderId) {
      return { verified: false, error: 'Payment does not belong to this order.' };
    }
    if (Number(payment.amount) !== expectedPaise) {
      return { verified: false, error: 'Paid amount does not match the booking amount.' };
    }

    if (payment.status === 'authorized') {
      payment = await instance.payments.capture(paymentId, payment.amount, payment.currency);
    }

    if (payment.status !== 'captured') {
      return { verified: false, error: `Payment is ${payment.status}, not captured.` };
    }

    return { verified: true, simulated: false, payment };
  } catch (err) {
    console.error('❌ [PaymentService] Error verifying Razorpay payment:', err);
    return { verified: false, error: err.error?.description || err.message };
  }
}

/**
 * Verify a Razorpay webhook using the RAW request body (Razorpay signs the exact bytes it sent).
 */
async function verifyRazorpayWebhook(rawBody, signature) {
  const config = await getPaymentConfig();
  const secret = config.razorpay.webhookSecret;
  if (!secret || secret.includes('sample') || !rawBody) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}

/**
 * ─────────────────────────────────────────────────────────────
 * PAYPAL: Helper to fetch OAuth Access Token
 * ─────────────────────────────────────────────────────────────
 */
async function getPayPalAccessToken(clientId, clientSecret, mode) {
  const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Failed to get PayPal token');
  return { token: data.access_token, baseUrl };
}

/**
 * ─────────────────────────────────────────────────────────────
 * PAYPAL: Create Order (Auto-converts INR to USD)
 * ─────────────────────────────────────────────────────────────
 */
async function createPayPalOrder({ amountINR, bookingRef, notes = {} }) {
  const config = await getPaymentConfig();
  // Standard conversion 1 USD ~ 85 INR (for international card checkout)
  const amountUSD = Math.max(1, (Number(amountINR) / 85).toFixed(2));

  if (!config.paypal.isConfigured) {
    console.log(`\x1b[33m[PAYMENT SIMULATOR] Creating simulated PayPal order for $${amountUSD} (₹${amountINR})\x1b[0m`);
    return {
      gateway: 'PAYPAL',
      orderId: `pp_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amountUSD,
      currency: 'USD',
      clientId: config.paypal.clientId || 'paypal_sandbox_simulated',
      simulated: true
    };
  }

  try {
    const { token, baseUrl } = await getPayPalAccessToken(
      config.paypal.clientId, 
      config.paypal.clientSecret, 
      config.paypal.mode
    );

    const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: bookingRef,
            description: `UniCoach 1:1 Mentorship (${bookingRef})`,
            amount: {
              currency_code: 'USD',
              value: amountUSD.toString()
            }
          }
        ]
      })
    });

    const orderData = await res.json();
    if (!res.ok) throw new Error(orderData.message || 'Failed to create PayPal order');

    return {
      gateway: 'PAYPAL',
      orderId: orderData.id,
      amountUSD,
      currency: 'USD',
      clientId: config.paypal.clientId,
      simulated: false
    };
  } catch (err) {
    console.error('❌ [PaymentService] PayPal Order Creation Error:', err);
    throw new Error(err.message || 'Failed to create PayPal order');
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * PAYPAL: Capture Order
 * ─────────────────────────────────────────────────────────────
 */
async function capturePayPalOrder({ orderId }) {
  const config = await getPaymentConfig();

  if (!config.paypal.isConfigured || (orderId && orderId.startsWith('pp_sim_'))) {
    console.log(`\x1b[33m[PAYMENT SIMULATOR] Captured simulated PayPal order ${orderId}\x1b[0m`);
    return {
      verified: true,
      captured: true,
      simulated: true,
      paymentId: `pp_pay_sim_${Date.now()}`
    };
  }

  try {
    const { token, baseUrl } = await getPayPalAccessToken(
      config.paypal.clientId, 
      config.paypal.clientSecret, 
      config.paypal.mode
    );

    const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'COMPLETED') {
      throw new Error(data.message || 'PayPal capture failed');
    }

    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.id;
    return {
      verified: true,
      captured: true,
      simulated: false,
      paymentId: captureId
    };
  } catch (err) {
    console.error('❌ [PaymentService] PayPal Capture Error:', err);
    return { verified: false, error: err.message };
  }
}

module.exports = {
  getPaymentConfig,
  getRazorpayInstance,
  isSimulationAllowed,
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyRazorpayWebhook,
  createPayPalOrder,
  capturePayPalOrder
};
