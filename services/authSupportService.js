const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');
const AuthCode = require('../models/AuthCode');
const Transaction = require('../models/Transaction');

dotenv.config();

const AUTH_CODE_TTL_MINUTES = 15;
const jwtSecret = process.env.JWT_SECRET;

let transporter = null;

async function initializeTransporter() {
  if (transporter) return transporter;

  // Support both this application's EMAIL_* names and the conventional
  // SMTP_* names used by most deployment dashboards.
  const emailUser = String(process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const emailPassword = String(process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
  const emailHost = String(process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const emailPort = Number.parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const emailSecure = String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || '').toLowerCase() === 'true' || emailPort === 465;

  if (!emailUser || !emailPassword || emailUser === 'your-email@gmail.com' || emailPassword === 'your-app-password') {
    throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASSWORD to a mailbox and its app password.');
  }

  if (!Number.isInteger(emailPort) || emailPort < 1 || emailPort > 65535) {
    throw new Error('EMAIL_PORT must be a valid SMTP port.');
  }

  const candidate = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    requireTLS: !emailSecure,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });

  // Fail before accepting an OTP request. A test/Ethereal mailbox is not a
  // fallback here because it cannot deliver a code to the registering user.
  await candidate.verify();
  transporter = candidate;
  return transporter;
}

initializeTransporter().catch(error => {
  console.error('Transporter initialization failed:', error.message);
});

async function upsertAuthCode(email, purpose, code) {
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MINUTES * 60 * 1000);
  await AuthCode.findOneAndUpdate(
    { email, purpose },
    { $set: { code, expiresAt } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function getAuthCodeRecord(email, purpose) {
  const record = await AuthCode.findOne({ email, purpose }).lean();
  if (!record) return null;

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    await AuthCode.deleteOne({ _id: record._id });
    return null;
  }

  return record;
}

async function consumeAuthCode(email, purpose) {
  await AuthCode.deleteOne({ email, purpose });
}

async function authenticateUserRequest(req) {
  if (!jwtSecret) {
    return { error: { status: 500, body: { error: 'Server configuration error' } } };
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return { error: { status: 401, body: { error: 'No token provided' } } };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.accountType === 'admin') {
      return { error: { status: 403, body: { error: 'Admin accounts cannot use student OCR extraction.' } } };
    }

    const user = await User.findById(decoded.id).select('_id isAdmin');
    if (!user || user.isAdmin) {
      return { error: { status: 403, body: { error: 'Student account required' } } };
    }

    return { user, decoded };
  } catch (error) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }
}

async function authenticateAdminRequest(req) {
  if (!jwtSecret) {
    return { error: { status: 500, body: { error: 'Server configuration error' } } };
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return { error: { status: 401, body: { error: 'No token provided' } } };
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    let admin = null;

    if (decoded.accountType === 'admin') {
      admin = await Admin.findById(decoded.id);
    }

    if (!admin) {
      const legacyAdmin = await User.findById(decoded.id);
      if (legacyAdmin?.isAdmin) {
        admin = legacyAdmin;
      }
    }

    if (!admin) {
      return { error: { status: 403, body: { error: 'Admin access required' } } };
    }

    return { admin, decoded };
  } catch (error) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }
}

function isSuperAdminAccount(admin) {
  return Boolean(admin?.isSuperAdmin);
}

async function resolveAuthenticatedAdmin(req) {
  if (req.auth && req.auth.admin) {
    return { admin: req.auth.admin, decoded: req.auth.decoded };
  }
  if (req.admin) {
    return { admin: req.admin, decoded: null };
  }
  return authenticateAdminRequest(req);
}

async function logAdminTransaction(admin, action, entityType, entityId = '', details = '', ipAddress = '', userAgent = '') {
  try {
    if (!admin?._id) return;

    await Transaction.create({
      adminId: admin._id,
      adminModel: admin?.constructor?.modelName === 'User' ? 'User' : 'Admin',
      adminName: admin.name || admin.email || 'Admin',
      action: String(action || '').trim(),
      entityType: String(entityType || '').trim(),
      entityId: String(entityId || '').trim(),
      details: String(details || '').trim(),
      ipAddress: String(ipAddress || '').trim(),
      userAgent: String(userAgent || '').trim()
    });
  } catch (error) {
    console.error('Transaction logging failed:', error.message);
  }
}

module.exports = {
  initializeTransporter,
  upsertAuthCode,
  getAuthCodeRecord,
  consumeAuthCode,
  authenticateUserRequest,
  authenticateAdminRequest,
  resolveAuthenticatedAdmin,
  isSuperAdminAccount,
  logAdminTransaction
};
