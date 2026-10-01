const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const LoginAttempt = require('../models/LoginAttempt');
const {
  initializeTransporter,
  upsertAuthCode,
  getAuthCodeRecord,
  consumeAuthCode,
  isSuperAdminAccount
} = require('./authSupportService');
const { extractOrf } = require('./orfService');
const logger = require('../utils/logger');

const mailFromAddress = String(process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const MAIL_FROM = mailFromAddress ? `"PHINMA SmartServe" <${mailFromAddress}>` : '"Verification" <verify@example.com>';
const jwtSecret = process.env.JWT_SECRET;

// Rate limiting configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

const {
  sanitizeString,
  sanitizeEmail,
  normalizeResetCode,
  validateEmail,
  validatePassword,
  sanitizeRegistrationInput,
  validateName,
  validateAge
} = require('../utils/sanitize');
function normalizeStoredLink(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const anchorHrefMatch = raw.match(/<a\b[^>]*\bhref\s*=\s*(['"'])(.*?)\1/i);
  if (anchorHrefMatch?.[2]) {
    return anchorHrefMatch[2].trim();
  }

  return raw.replace(/<[^>]*>/g, '').trim();
}

function getClientIp(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || '';
}

/**
 * Record a login attempt for rate limiting.
 */
async function recordLoginAttempt(email, ipAddress, userAgent, successful) {
  try {
    await LoginAttempt.create({ email, ipAddress, userAgent, successful });
  } catch (error) {
    logger.error('Failed to record login attempt', { error: error.message });
  }
}

async function findAccountByEmail(email) {
  const admin = await Admin.findOne({ email });
  if (admin) {
    return { account: admin, accountType: 'admin', isAdmin: true };
  }

  const user = await User.findOne({ email });
  if (user) {
    return { account: user, accountType: user.isAdmin ? 'admin' : 'user', isAdmin: Boolean(user.isAdmin) };
  }

  return null;
}

function buildTokenPayload(account, accountType, isAdmin) {
  return {
    id: account._id,
    email: account.email,
    isAdmin: Boolean(isAdmin),
    accountType: accountType === 'admin' ? 'admin' : 'user'
  };
}

async function buildCurrentUserPayload(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;

  const registration = await Registration.findOne({ userId: user._id }).sort({ updatedAt: -1, createdAt: -1 }).lean();
  if (!registration) {
    return { ...user, accountType: user.isAdmin ? 'admin' : 'user' };
  }

  return {
    ...user,
    accountType: user.isAdmin ? 'admin' : 'user',
    fullname: registration.fullname || user.fullname || user.name || '',
    age: registration.age ?? user.age ?? null,
    yearLevel: registration.yearLevel || user.yearLevel || '',
    studentType: registration.studentType || user.studentType || '',
    pictureOfId: registration.pictureOfId || user.pictureOfId || '',
    module: registration.module || user.module || '',
    uniformType: registration.uniformType || user.uniformType || '',
    books: registration.books || user.books || '',
    course: registration.course || user.course || '',
    pickupDate: registration.pickupDate || user.pickupDate || null,
    registrationId: registration._id || null,
    registrationUpdatedAt: registration.updatedAt || null
  };
}

async function sendVerificationCode(body) {
  const email = sanitizeEmail(body?.email || '');
  if (!email || !validateEmail(email)) {
    return { error: { status: 400, body: { error: 'Invalid email format' } } };
  }

  const existingUser = await User.findOne({ email }).select('_id');
  if (existingUser) {
    return { error: { status: 409, body: { error: 'An account with that email already exists' } } };
  }

  const existingAdmin = await Admin.findOne({ email }).select('_id');
  if (existingAdmin) {
    return { error: { status: 409, body: { error: 'An account with that email already exists' } } };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = await initializeTransporter().catch(error => {
    logger.error('Verification email service unavailable', { error: error.message });
    return null;
  });
  if (!transporter) {
    return { error: { status: 503, body: { error: 'Email service is unavailable. Please try again later.' } } };
  }

  const mailOptions = {
    from: MAIL_FROM,
    to: email,
    subject: 'Email Verification Code',
    text: `Your verification code is ${code}. This code will expire in 15 minutes.`,
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (Array.isArray(info.rejected) && info.rejected.length > 0 && (!Array.isArray(info.accepted) || info.accepted.length === 0)) {
      console.error('Verification email rejected for recipients:', info.rejected.join(', '));
      return { error: { status: 502, body: { error: 'Email provider rejected the recipient address.' } } };
    }
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`Verification preview: ${preview}`);
    await upsertAuthCode(email, 'verification', code);
    return { body: { message: 'Verification code sent successfully.' } };
  } catch (emailError) {
    console.error('Email error:', emailError.message);
    return { error: { status: 500, body: { error: 'Failed to send verification code. Please try again.' } } };
  }
}

async function forgotPassword(body) {
  const email = sanitizeEmail(body?.email || '');
  if (!email || !validateEmail(email)) {
    return { error: { status: 400, body: { error: 'Invalid email format' } } };
  }

  const accountLookup = await findAccountByEmail(email);
  if (!accountLookup) {
    return { error: { status: 404, body: { error: 'Account not found' } } };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = await initializeTransporter().catch(error => {
    logger.error('Password reset email service unavailable', { error: error.message });
    return null;
  });
  if (!transporter) {
    return { error: { status: 503, body: { error: 'Email service is unavailable. Please try again later.' } } };
  }

  const mailOptions = {
    from: MAIL_FROM,
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is ${code}. This code will expire in 15 minutes.`,
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1>${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (Array.isArray(info.rejected) && info.rejected.length > 0 && (!Array.isArray(info.accepted) || info.accepted.length === 0)) {
      console.error('Reset email rejected for recipients:', info.rejected.join(', '));
      return { error: { status: 502, body: { error: 'Email provider rejected the recipient address.' } } };
    }
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`Reset preview: ${preview}`);
    await upsertAuthCode(email, 'password_reset', code);
    return { body: { message: 'Password reset code sent successfully.' } };
  } catch (emailError) {
    console.error('Reset email error:', emailError.message);
    return { error: { status: 500, body: { error: 'Failed to send reset code. Please try again.' } } };
  }
}

async function resetPassword(body) {
  const email = sanitizeEmail(body?.email || '');
  const code = normalizeResetCode(body?.code || body?.resetCode || '');
  const newPassword = String(body?.newPassword || '');
  const confirmPassword = String(body?.confirmPassword || '');

  if (!email || !validateEmail(email)) {
    return { error: { status: 400, body: { error: 'Invalid email format' } } };
  }
  if (!code) {
    return { error: { status: 400, body: { error: 'Reset code is required' } } };
  }
  if (!newPassword || !confirmPassword) {
    return { error: { status: 400, body: { error: 'New password and confirmation are required' } } };
  }
  if (newPassword !== confirmPassword) {
    return { error: { status: 400, body: { error: 'Passwords do not match' } } };
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { error: { status: 400, body: { error: passwordValidation.message } } };
  }

  const record = await getAuthCodeRecord(email, 'password_reset');
  if (!record || record.code !== code) {
    return { error: { status: 400, body: { error: 'Invalid or expired reset code' } } };
  }

  const accountLookup = await findAccountByEmail(email);
  if (!accountLookup) {
    return { error: { status: 404, body: { error: 'Account not found' } } };
  }

  accountLookup.account.password = newPassword;
  await accountLookup.account.save();
  await consumeAuthCode(email, 'password_reset');

  return { body: { message: 'Password reset successful.' } };
}

async function registerUser(body) {
  const { sanitized, errors } = sanitizeRegistrationInput(body || {});
  if (errors.length > 0) {
    return { error: { status: 400, body: { error: errors[0] } } };
  }

  if (sanitized.password !== sanitized.confirmPassword) {
    return { error: { status: 400, body: { error: 'Passwords do not match' } } };
  }

  const existingEmailUser = await User.findOne({ email: sanitized.email }).select('_id');
  if (existingEmailUser) {
    return { error: { status: 409, body: { error: 'Email already registered' } } };
  }

  const existingEmailAdmin = await Admin.findOne({ email: sanitized.email }).select('_id');
  if (existingEmailAdmin) {
    return { error: { status: 409, body: { error: 'Email already registered' } } };
  }

  const existingStudentNumber = await User.findOne({ studentNumber: sanitized.studentNumber }).select('_id');
  if (existingStudentNumber) {
    return { error: { status: 409, body: { error: 'Student number already registered' } } };
  }

  const record = await getAuthCodeRecord(sanitized.email, 'verification');
  if (!record || record.code !== sanitized.verificationCode) {
    return { error: { status: 400, body: { error: 'Invalid or expired verification code' } } };
  }

  const user = new User({
    name: sanitized.name,
    firstName: sanitized.firstName,
    middleName: sanitized.middleName,
    lastName: sanitized.lastName,
    email: sanitized.email,
    password: sanitized.password,
    birthday: sanitized.birthday,
    age: sanitized.age,
    studentNumber: sanitized.studentNumber,
    status: 'pending'
  });

  await user.save();
  await consumeAuthCode(sanitized.email, 'verification');

  logger.auth('user_registered', user._id.toString(), { email: user.email, studentNumber: user.studentNumber });

  return {
    status: 201,
    body: {
      message: 'Registration successful. You can now log in.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentNumber: user.studentNumber
      }
    }
  };
}

async function loginAccount(body, req) {
  if (!jwtSecret) {
    return { error: { status: 500, body: { error: 'Server configuration error' } } };
  }

  const email = sanitizeEmail(body?.email || '');
  const password = String(body?.password || '');
  const ipAddress = getClientIp(req);
  const userAgent = String(req.headers?.['user-agent'] || '');

  if (!email || !password) {
    return { error: { status: 400, body: { error: 'Email and password are required' } } };
  }

  const accountLookup = await findAccountByEmail(email);
  if (!accountLookup) {
    await recordLoginAttempt(email, ipAddress, userAgent, false);
    return { error: { status: 401, body: { error: 'Invalid email or password' } } };
  }

  // Check if account is locked
  const account = accountLookup.account;
  if (account.lockedUntil && account.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((account.lockedUntil - new Date()) / 60000);
    logger.auth('login_account_locked', account._id.toString(), { email, ipAddress });
    return { error: { status: 423, body: { error: `Account is locked. Try again in ${remainingMinutes} minutes.` } } };
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    // Increment failed login attempts
    account.failedLoginAttempts = (account.failedLoginAttempts || 0) + 1;
    
    // Lock account if max attempts reached
    if (account.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      account.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      logger.auth('login_account_locked', account._id.toString(), { 
        email, 
        ipAddress, 
        failedAttempts: account.failedLoginAttempts 
      });
    }
    
    await account.save();
    await recordLoginAttempt(email, ipAddress, userAgent, false);
    logger.auth('login_failed', account._id.toString(), { email, ipAddress });
    
    return { error: { status: 401, body: { error: 'Invalid email or password' } } };
  }

  // Successful login - reset failed attempts
  account.failedLoginAttempts = 0;
  account.lockedUntil = null;

  if (
    account?.constructor?.modelName === 'User' &&
    typeof account.hasHashedPassword === 'function' &&
    !account.hasHashedPassword()
  ) {
    account.password = password;
  }

  account.lastLoginAt = new Date();
  account.lastLoginIp = ipAddress;
  await account.save();
  await recordLoginAttempt(email, ipAddress, userAgent, true);

  const payload = buildTokenPayload(account, accountLookup.accountType, accountLookup.isAdmin);
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

  logger.auth('user_login', account._id.toString(), { 
    email: account.email, 
    accountType: accountLookup.accountType,
    isAdmin: accountLookup.isAdmin 
  });

  return {
    body: {
      message: 'Login successful',
      token,
      isAdmin: Boolean(accountLookup.isAdmin),
      accountType: accountLookup.accountType,
      name: account.name || '',
      email: account.email || '',
      isSuperAdmin: Boolean(account.isSuperAdmin)
    }
  };
}

async function verifySuperAdminAccess(req) {
  const admin = req.admin || req.auth?.admin;
  if (!admin) {
    return { error: { status: 401, body: { error: 'Unauthorized' } } };
  }
  if (!isSuperAdminAccount(admin)) {
    return { error: { status: 403, body: { error: 'Super admin access required' } } };
  }

  const email = sanitizeEmail(String(req.body?.email || '').trim());
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return { error: { status: 400, body: { error: 'Email and password are required' } } };
  }

  const accountLookup = await findAccountByEmail(email);
  const account = accountLookup?.account;
  if (!account || accountLookup?.accountType !== 'admin' || !isSuperAdminAccount(account)) {
    return { error: { status: 401, body: { error: 'Invalid email or password. Please try again.' } } };
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    return { error: { status: 401, body: { error: 'Invalid email or password. Please try again.' } } };
  }

  return { body: { verified: true } };
}

async function getCurrentAccount(req) {
  if (!jwtSecret) {
    return { error: { status: 500, body: { error: 'Server configuration error' } } };
  }

  const decoded = req.auth?.decoded || (() => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    try {
      return jwt.verify(token, jwtSecret);
    } catch (_) {
      return null;
    }
  })();

  if (!decoded?.id) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  if (decoded.accountType === 'admin') {
    const admin = await Admin.findById(decoded.id).select('-password').lean();
    if (admin) {
      return { body: { ...admin, accountType: 'admin', isAdmin: true } };
    }

    const legacyAdmin = await User.findById(decoded.id).select('-password').lean();
    if (legacyAdmin?.isAdmin) {
      return { body: { ...legacyAdmin, accountType: 'admin', isAdmin: true } };
    }

    return { error: { status: 404, body: { error: 'Account not found' } } };
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || user.isAdmin) {
    return { error: { status: 404, body: { error: 'Account not found' } } };
  }

  return { body: await buildCurrentUserPayload(user) };
}

async function updateProfile(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const user = await User.findById(userId);
  if (!user || user.isAdmin) {
    return { error: { status: 404, body: { error: 'User not found' } } };
  }
  // Keep this before assigning a replacement upload so only the old ORF is removed.
  const previousPictureOfId = String(user.pictureOfId || '').trim();

  const nextName = sanitizeString(req.body?.name || '');
  const nextEmail = sanitizeEmail(req.body?.email || '');
  const hasRegistrationPayload = Boolean(
    req.body?.resubmit ||
    req.body?.fullname ||
    req.body?.course ||
    req.body?.module ||
    req.body?.books ||
    req.body?.uniformType ||
    req.body?.pictureOfId ||
    req.body?.yearLevel ||
    req.body?.studentType
  );

  if (nextName) {
    if (!validateName(nextName)) {
      return { error: { status: 400, body: { error: 'Name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes' } } };
    }
    user.name = nextName;
    user.fullname = nextName;
  }

  if (nextEmail) {
    if (!validateEmail(nextEmail)) {
      return { error: { status: 400, body: { error: 'Invalid email format' } } };
    }

    const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: user._id } }).select('_id');
    if (existingUser) {
      return { error: { status: 409, body: { error: 'Email already in use' } } };
    }

    const existingAdmin = await Admin.findOne({ email: nextEmail }).select('_id');
    if (existingAdmin) {
      return { error: { status: 409, body: { error: 'Email already in use' } } };
    }

    user.email = nextEmail;
  }

  if (hasRegistrationPayload) {
    const fullname = sanitizeString(req.body?.fullname || user.fullname || user.name || '');
    const age = Number(req.body?.age);
    const course = sanitizeString(req.body?.course || '');
    const yearLevel = sanitizeString(req.body?.yearLevel || '');
    const studentType = String(req.body?.studentType || '').trim().toLowerCase();
    const moduleValue = sanitizeString(req.body?.module || '');
    const booksValue = sanitizeString(req.body?.books || '');
    const uniformType = sanitizeString(req.body?.uniformType || '');
    let pictureOfId = normalizeStoredLink(req.body?.pictureOfId);

    if (req.file) {
      pictureOfId = `/uploads/orf/${req.file.filename}`;
    }

    if (!fullname) {
      return { error: { status: 400, body: { error: 'Full name is required' } } };
    }
    if (!validateAge(age)) {
      return { error: { status: 400, body: { error: 'Age must be a valid number' } } };
    }
    if (!course) {
      return { error: { status: 400, body: { error: 'Course is required' } } };
    }
    if (studentType && !['regular', 'irregular'].includes(studentType)) {
      return { error: { status: 400, body: { error: 'Student type must be regular or irregular' } } };
    }
    if (/^javascript:/i.test(pictureOfId)) {
      return { error: { status: 400, body: { error: 'Invalid document format' } } };
    }

    user.fullname = fullname;
    user.age = age;
    user.course = course;
    user.yearLevel = yearLevel;
    user.studentType = studentType || user.studentType || 'regular';
    user.module = moduleValue;
    user.books = booksValue;
    user.uniformType = uniformType;
    user.pictureOfId = pictureOfId;
    user.status = 'pending';

    await Registration.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          fullname,
          age,
          course,
          yearLevel,
          studentType: studentType || 'regular',
          module: moduleValue,
          books: booksValue,
          uniformType,
          pictureOfId
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  if (req.file) {
    const previousPathMatch = previousPictureOfId.match(/^\/uploads\/orf\/([^/?#]+)$/i);
    if (previousPathMatch?.[1]) {
      const previousFilePath = path.resolve(__dirname, '..', 'uploads', 'orf', previousPathMatch[1]);
      try {
        fs.unlinkSync(previousFilePath);
      } catch (_) {
        // Ignore missing/corrupt previous files
      }
    }
  }

  await user.save();
  const payload = await buildCurrentUserPayload(user);

  return {
    body: {
      message: hasRegistrationPayload ? 'Registration saved successfully' : 'Profile updated successfully',
      status: payload.status,
      user: payload
    }
  };
}

async function changePassword(req) {
  const userId = req.user?._id || req.auth?.user?._id || req.auth?.decoded?.id;
  if (!userId) {
    return { error: { status: 401, body: { error: 'Invalid token' } } };
  }

  const oldPassword = String(req.body?.oldPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  if (!oldPassword || !newPassword) {
    return { error: { status: 400, body: { error: 'Old password and new password are required' } } };
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { error: { status: 400, body: { error: passwordValidation.message } } };
  }

  const user = await User.findById(userId);
  if (!user || user.isAdmin) {
    return { error: { status: 404, body: { error: 'User not found' } } };
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return { error: { status: 400, body: { error: 'Old password is incorrect' } } };
  }

  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return { error: { status: 400, body: { error: 'New password must be different from current password' } } };
  }

  user.password = newPassword;
  await user.save();

  logger.auth('password_changed', userId.toString(), { email: user.email });

  return { body: { message: 'Password changed successfully' } };
}

async function extractOrfData(req) {
  if (!req.file?.buffer) {
    return { error: { status: 400, body: { error: 'ORF file is required' } } };
  }

  const result = await extractOrf(req.file.buffer, req.file.originalname, req.file.mimetype);
  if (result?.error) {
    return result;
  }

  return { body: result };
}

module.exports = {
  sendVerificationCode,
  forgotPassword,
  resetPassword,
  registerUser,
  loginAccount,
  verifySuperAdminAccess,
  getCurrentAccount,
  updateProfile,
  changePassword,
  extractOrfData
};
