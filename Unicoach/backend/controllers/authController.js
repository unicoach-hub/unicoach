const User = require('../models/User');
const { applyAttributionToLead } = require('../utils/attribution');
const { sendMetaEvent } = require('../services/metaConversions');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { normalizePhone } = require('../utils/twilio');
const { sendEmail } = require('../utils/email');
const { escapeHtml } = require('../utils/escapeHtml');

const { JWT_SECRET } = require('../config/jwt');

/**
 * Helper: Detect and enrich User with Unicoach Mentor profile
 */
const enrichUserWithMentor = async (userDoc) => {
  if (!userDoc) return null;
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  
  try {
    const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
    const userId = userObj._id || userObj.id;
    let mentor = await UnicoachMentor.findOne({ userId });

    // Legacy mentor without a linked account: link only by a PROVEN email (Google sign-in or verified),
    // never by phone or an unverified email typed at registration — that would hand over the studio and its payouts.
    const emailIsProven = userObj.authProvider === 'google' || userObj.isEmailVerified === true;
    if (!mentor && userObj.email && emailIsProven) {
      mentor = await UnicoachMentor.findOne({
        email: userObj.email.toLowerCase().trim(),
        $or: [{ userId: null }, { userId: { $exists: false } }]
      });
    }

    if (mentor) {
      // Auto-link userId to mentor if unlinked
      if (!mentor.userId && userId) {
        mentor.userId = userObj._id || userObj.id;
        await mentor.save().catch(() => {});
      }
      return {
        id: userObj._id || userObj.id,
        name: mentor.name || userObj.name,
        email: userObj.email || mentor.email,
        phone: userObj.phone || mentor.phone,
        role: userObj.role === 'admin' ? 'admin' : 'mentor',
        isMentor: true,
        mentorHandle: mentor.handle,
        mentorStatus: mentor.applicationStatus,
        isVerified: mentor.isVerified,
        avatar: userObj.avatar,
        authProvider: userObj.authProvider || 'local',
        profile: userObj.profile
      };
    }
  } catch (err) {
    console.error('Error resolving mentor status:', err.message);
  }

  return {
    id: userObj._id || userObj.id,
    name: userObj.name,
    email: userObj.email,
    phone: userObj.phone,
    role: userObj.role || 'user',
    isMentor: false,
    mentorHandle: null,
    avatar: userObj.avatar,
    authProvider: userObj.authProvider || 'local',
    profile: userObj.profile
  };
};

/**
 * Make sure every student who signs up or logs in shows up in the admin Leads CRM.
 * - New lead: created with the sign-in method as its source.
 * - Existing lead (e.g. from an eligibility form): we only add a note on account creation and fill a missing phone,
 *   so counsellor-managed fields (status, assignee, follow-ups) are never overwritten.
 * Mentors and admins are skipped. Never throws: auth must not fail because of CRM sync.
 */
const syncLeadFromAuth = async (enrichedUser, { method, isNewAccount, attribution }) => {
  try {
    if (!enrichedUser || enrichedUser.role === 'admin' || enrichedUser.isMentor) return;

    const Lead = require('../models/Lead');
    const email = (enrichedUser.email || '').toLowerCase().trim();
    const phone = (enrichedUser.phone || '').trim();
    if (!email && !phone) return;

    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });
    const existing = await Lead.findOne({ $or: conditions });

    const note = isNewAccount
      ? `Created a UniCoach account via ${method}`
      : `Logged in via ${method}`;

    if (!existing) {
      const lead = new Lead({
        name: enrichedUser.name || 'Student',
        email: email || 'Not provided',
        phone: phone || 'Not provided',
        source: isNewAccount ? `Signup - ${method}` : `Login - ${method}`,
        latestSource: isNewAccount ? `Signup - ${method}` : `Login - ${method}`,
        status: 'new',
        verified: true,
        lastInquiryAt: new Date(),
        activities: [{ type: 'note', comment: note, performedBy: 'System' }]
      });
      applyAttributionToLead(lead, attribution);
      await lead.save();
      return;
    }

    const update = {};
    if (phone && (!existing.phone || existing.phone === 'Not provided')) update.$set = { phone };
    if (isNewAccount) {
      update.$set = { ...(update.$set || {}), lastInquiryAt: new Date(), latestSource: `Signup - ${method}` };
      update.$push = { activities: { type: 'note', comment: note, performedBy: 'System' } };
    }
    if (attribution) {
      const tracked = { attribution: existing.attribution?.toObject?.() || existing.attribution };
      applyAttributionToLead(tracked, attribution);
      if (tracked.attribution) update.$set = { ...(update.$set || {}), attribution: tracked.attribution };
    }
    if (Object.keys(update).length > 0) {
      await Lead.updateOne({ _id: existing._id }, update);
    }
  } catch (err) {
    console.warn('[Auth] Lead CRM sync failed (non-blocking):', err.message);
  }
};

/**
 * POST /api/auth/register
 * Register user via Email + Password (phone is optional contact info, never a login method)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    // Check if user already exists
    const queryConditions = [{ email: cleanEmail }];
    if (normalizedPhone) queryConditions.push({ phone: normalizedPhone });
    
    const existing = await User.findOne({ $or: queryConditions });
    if (existing) {
      return res.status(400).json({ 
        message: 'An account with this email or phone already exists. Please log in.' 
      });
    }

    if (password.length !== 6) {
      return res.status(400).json({ message: 'Password must be exactly 6 characters' });
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      phone: normalizedPhone,
      passwordHash,
      authProvider: 'local',
      isEmailVerified: false,
      role: 'user'
    });

    await user.save();

    const enrichedUser = await enrichUserWithMentor(user);
    syncLeadFromAuth(enrichedUser, { method: 'Email', isNewAccount: true, attribution: req.body.attribution });
    sendMetaEvent({
      eventName: 'CompleteRegistration',
      eventId: req.body.attribution?.eventId,
      user: { email: user.email, phone: user.phone, name: user.name, externalId: user._id },
      req,
      attribution: req.body.attribution
    });
    const token = jwt.sign({ id: user._id, role: enrichedUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send Welcome Email asynchronously
    sendEmail({
      to: cleanEmail,
      subject: 'Welcome to UniCoach — Your Global Education Journey Begins',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #DE5C2B; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">UniCoach</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 600;">Global Study Abroad Advisory</p>
          </div>
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Welcome aboard, ${escapeHtml(name)}! 🎓</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Your UniCoach account is ready. You now have instant access to 3,600+ world universities, AI tools for SOP & IELTS, scholarship deadline tracking, and 1:1 mentor bookings.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${(process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '')}/universities" style="background: linear-gradient(135deg, #f97316 0%, #DE5C2B 100%); color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(222, 92, 43, 0.3);">
              Explore Target Universities →
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
            Need help? Reply directly to this email or reach us at <a href="mailto:unicoachedu@gmail.com" style="color: #DE5C2B; text-decoration: none;">unicoachedu@gmail.com</a>.
          </p>
        </div>
      `
    }).catch(e => console.warn('Welcome email non-blocking failed:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: enrichedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/auth/login
 * Log in via Email + Password (Google sign-in has its own route; there is no phone/OTP login)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // If user signed up via Google and has no local password yet
      if (!user.passwordHash) {
        return res.status(400).json({ 
          message: 'This account was created with Google Sign-In. Please click "Continue with Google" or use "Forgot Password" to set a password.' 
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const enrichedUser = await enrichUserWithMentor(user);
      syncLeadFromAuth(enrichedUser, { method: 'Email', isNewAccount: false });
      const token = jwt.sign({ id: user._id, role: enrichedUser.role }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        token,
        user: enrichedUser
      });
    }

    return res.status(400).json({ message: 'Please sign in with your email and password, or continue with Google.' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/auth/forgot-password
 * Dispatches a cryptographically secure, SHA-256 hashed reset token link to the user's email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // Anti-user enumeration: always return 200 generic success message
    const genericSuccess = {
      success: true,
      message: 'If an account with that email exists, we have sent a secure password reset link to your inbox.'
    };

    if (!user) {
      return res.json(genericSuccess);
    }

    // Generate unguessable 32-byte crypto token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity
    await user.save();

    // Reset link points at OUR site only: FRONTEND_URL, or the request origin when it is one of our
    // own domains (unicoach.com, unicoach.in, www…) or localhost in development. Never an arbitrary Origin header.
    const rawOrigin = req.headers.origin || req.headers.referer;
    let frontendOrigin = (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
    if (rawOrigin) {
      try {
        const parsed = new URL(rawOrigin);
        const isOwnDomain = /^https:\/\/([a-z0-9-]+\.)*unicoach\.(com|in)$/.test(parsed.origin);
        const isLocal = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(parsed.hostname);
        if (isOwnDomain || isLocal) frontendOrigin = parsed.origin;
      } catch (e) {}
    } else if (process.env.NODE_ENV !== 'production') {
      frontendOrigin = 'http://localhost:5173';
    }

    const resetUrl = `${frontendOrigin}/reset-password?token=${resetToken}&id=${user._id}`;

    // Dispatch branded password reset email in the background (an awaited failure would reveal which emails exist)
    sendEmail({
      to: cleanEmail,
      subject: 'Reset Your UniCoach Password',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #DE5C2B; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">UniCoach</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 600;">Account Security Team</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 19px; font-weight: 700; margin-bottom: 12px; text-align: center;">Password Reset Request</h2>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Hello ${escapeHtml(user.name || 'Student')},<br><br>
            We received a request to reset the password for your UniCoach account. Click the button below to choose a new password:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316 0%, #DE5C2B 100%); color: #ffffff; font-weight: 700; text-decoration: none; padding: 15px 32px; border-radius: 14px; font-size: 15px; display: inline-block; box-shadow: 0 4px 16px rgba(222, 92, 43, 0.35);">
              Reset Password →
            </a>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
              ⏱️ <b>Notice:</b> This link is single-use and will expire in <b>30 minutes</b>. If you did not request this, please ignore this email; your account remains secure.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 11px; line-height: 1.4; word-break: break-all; margin-top: 20px;">
            If the button above does not work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #DE5C2B;">${resetUrl}</a>
          </p>

          <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; margin-top: 24px;">
            UniCoach Global Admissions Platform • <a href="mailto:unicoachedu@gmail.com" style="color: #DE5C2B; text-decoration: none;">unicoachedu@gmail.com</a>
          </p>
        </div>
      `
    }).catch((mailErr) => console.error('Password reset email failed:', mailErr.message));

    return res.json(genericSuccess);
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error processing request' });
  }
};

/**
 * POST /api/auth/reset-password
 * Verifies SHA-256 token and updates the user's password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, id, newPassword } = req.body;

    if (!token || !id || !newPassword) {
      return res.status(400).json({ message: 'Token, user ID, and new password are required' });
    }

    if (newPassword.length !== 6) {
      return res.status(400).json({ message: 'Password must be exactly 6 characters' });
    }

    // Compute SHA-256 hash of provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Look for matching user where token matches and has not expired
    const user = await User.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset link is invalid or has expired. Please request a new link.' 
      });
    }

    // Hash the new password and wipe the reset token
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation alert email
    sendEmail({
      to: user.email,
      subject: 'Your UniCoach Password Has Been Updated',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 8px;">Password Updated Successfully ✅</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hello ${escapeHtml(user.name || 'Student')}, your password for UniCoach has been successfully changed. You can now log in with your new credentials.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
            If you did not perform this change, please contact us immediately at unicoachedu@gmail.com.
          </p>
        </div>
      `
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Password updated successfully. You can now log in.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error updating password' });
  }
};

/**
 * POST /api/auth/google
 * Google 1-Click OAuth sign-in / registration
 */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || '324611777052-7p8vf6php65bdf7eljj753al4lj6d3kp.apps.googleusercontent.com';
    let payload;

    // Verify token signature & audience with Google's public key servers.
    // Never fall back to an unverified decode: that would let forged tokens log in as any user.
    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('Google client ID token verification failed:', verifyErr.message);
      return res.status(401).json({ message: 'Invalid Google credential token' });
    }

    const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload;
    if (!email) {
      return res.status(400).json({ message: 'Google account has no associated email address' });
    }
    if (emailVerified !== true) {
      return res.status(401).json({ message: 'Your Google email address is not verified. Please verify it with Google and try again.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }]
    });
    const isNewAccount = !user;

    if (!user) {
      user = new User({
        name: name || 'Student',
        email: cleanEmail,
        googleId,
        avatar: picture,
        authProvider: 'google',
        isEmailVerified: true,
        role: 'user'
      });
      await user.save();
    } else {
      let changed = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        changed = true;
      }
      if (user.authProvider === 'local') {
        user.authProvider = 'google';
        changed = true;
      }
      if (changed) await user.save();
    }

    const enrichedUser = await enrichUserWithMentor(user);
    syncLeadFromAuth(enrichedUser, { method: 'Google', isNewAccount, attribution: req.body.attribution });
    if (isNewAccount) {
      sendMetaEvent({
        eventName: 'CompleteRegistration',
        eventId: req.body.attribution?.eventId,
        user: { email: user.email, phone: user.phone, name: user.name, externalId: user._id },
        req,
        attribution: req.body.attribution
      });
    }
    const token = jwt.sign({ id: user._id, role: enrichedUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      user: enrichedUser,
      isNewAccount
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
};

/**
 * POST /api/auth/logout
 * Clears authentication cookie
 */
exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * GET /api/auth/me
 * Returns current authenticated user profile using HttpOnly cookie or bearer token
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpires -passwordHash -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const enrichedUser = await enrichUserWithMentor(user);
    return res.json({
      success: true,
      user: enrichedUser
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Exported for unit tests
exports.syncLeadFromAuth = syncLeadFromAuth;
