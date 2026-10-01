const nodemailer = require('nodemailer');
const { initializeTransporter } = require('./authSupportService');
const logger = require('../utils/logger');

const mailFromAddress = String(process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const MAIL_FROM = mailFromAddress
  ? `"PHINMA SmartServe" <${mailFromAddress}>`
  : '"PHINMA SmartServe" <noreply@phinmaed.com>';

const APP_BASE_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Send an email notification using the configured transporter.
 * Falls back silently if email is not configured (Ethereal preview logged).
 */
async function sendEmail({ to, subject, html }) {
  try {
    const transporter = await initializeTransporter();
    if (!transporter) {
      logger.warn('Email notification skipped — transporter not available', { to, subject });
      return { success: false, reason: 'transporter_unavailable' };
    }

    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    const rejected = Array.isArray(info.rejected) ? info.rejected : [];
    const accepted = Array.isArray(info.accepted) ? info.accepted : [];

    if (rejected.length > 0 && accepted.length === 0) {
      logger.warn('Email notification rejected by server', { to, subject, rejected });
      return { success: false, reason: 'rejected', details: rejected };
    }

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info('Email notification preview (Ethereal)', { to, subject, previewUrl });
    } else {
      logger.info('Email notification sent', { to, subject });
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    logger.error('Failed to send email notification', { to, subject, error: error.message });
    return { success: false, reason: error.message };
  }
}

/**
 * Send a notification to the user when their registration is approved.
 */
async function sendRegistrationApproved({ email, name, studentNumber, pickupDate }) {
  const formattedDate = pickupDate
    ? new Date(pickupDate).toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Manila'
      })
    : 'TBD (check your dashboard)';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #17357f 0%, #2447a8 100%); padding: 28px 32px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PHINMA SMARTSERVE</h1>
        <p style="color: #e0e7ff; margin: 6px 0 0; font-size: 14px;">Registration Approved</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          Your registration (Student #: <strong>${studentNumber}</strong>) has been 
          <span style="color: #059669; font-weight: 700;">approved</span>.
        </p>
        <div style="background: #f1f5f9; border-radius: 10px; padding: 18px 22px; margin: 18px 0;">
          <p style="margin: 0 0 8px; color: #334155; font-weight: 600;">📅 Pickup Schedule</p>
          <p style="margin: 0; color: #0f172a; font-size: 16px;">${formattedDate}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">
          Please bring your school ID and print-out of this confirmation.
        </p>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Visit your dashboard for full details:
          <a href="${APP_BASE_URL}/dashboard" style="color: #2563eb;">${APP_BASE_URL}/dashboard</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          PHINMA University · This is an automated notification. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '✅ Registration Approved — PHINMA SmartServe',
    html
  });
}

/**
 * Send a notification to the user when their registration is rejected.
 */
async function sendRegistrationRejected({ email, name, studentNumber, reason }) {
  const reasonText = reason || 'Please contact the registrar for more information.';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #991b1b 0%, #b91c1c 100%); padding: 28px 32px; text-align: center;">
        <h1 style="color: #fca5a5; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PHINMA SMARTSERVE</h1>
        <p style="color: #fecaca; margin: 6px 0 0; font-size: 14px;">Registration Status Update</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          Unfortunately, your registration (Student #: <strong>${studentNumber}</strong>) has been 
          <span style="color: #dc2626; font-weight: 700;">rejected</span>.
        </p>
        <div style="background: #fef2f2; border-radius: 10px; padding: 18px 22px; margin: 18px 0; border: 1px solid #fecaca;">
          <p style="margin: 0 0 6px; color: #991b1b; font-weight: 600;">📋 Reason</p>
          <p style="margin: 0; color: #b91c1c; font-size: 15px;">${reasonText}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          You may update your profile and resubmit:
          <a href="${APP_BASE_URL}/profile" style="color: #2563eb;">${APP_BASE_URL}/profile</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          PHINMA University · This is an automated notification. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '❌ Registration Rejected — PHINMA SmartServe',
    html
  });
}

/**
 * Send a pickup reminder 24 hours before the scheduled pickup.
 */
async function sendPickupReminder({ email, name, moduleName, pickupDate, pickupLocation }) {
  const formattedDate = pickupDate
    ? new Date(pickupDate).toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Manila'
      })
    : 'Scheduled date';

  const location = pickupLocation || 'School Supplies Office';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #17357f 0%, #2447a8 100%); padding: 28px 32px; text-align: center;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PHINMA SMARTSERVE</h1>
        <p style="color: #e0e7ff; margin: 6px 0 0; font-size: 14px;">Pickup Reminder</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 10px;">
          This is a reminder that your school supplies pickup is scheduled for:
        </p>
        <div style="background: #eff6ff; border-radius: 10px; padding: 18px 22px; margin: 16px 0; border: 1px solid #bfdbfe;">
          <p style="margin: 0 0 4px; color: #1e40af; font-weight: 600;">📦 Pickup Details</p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Module:</strong> ${moduleName || 'School Necessities'}</p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Location:</strong> ${location}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Please bring your school ID. View full schedule:
          <a href="${APP_BASE_URL}/dashboard" style="color: #2563eb;">${APP_BASE_URL}/dashboard</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          PHINMA University · This is an automated reminder. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '⏰ Pickup Reminder — Tomorrow — PHINMA SmartServe',
    html
  });
}

/**
 * Send a notification when the student did not show up for their pickup.
 */
async function sendNoShowNotification({ email, name, moduleName, originalDate }) {
  const formattedDate = originalDate
    ? new Date(originalDate).toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Manila'
      })
    : 'Scheduled date';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #92400e 0%, #b45309 100%); padding: 28px 32px; text-align: center;">
        <h1 style="color: #fde68a; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PHINMA SMARTSERVE</h1>
        <p style="color: #fef3c7; margin: 6px 0 0; font-size: 14px;">Missed Pickup</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          You missed your scheduled pickup on <strong>${formattedDate}</strong>${moduleName ? ` for <strong>${moduleName}</strong>` : ''}.
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Please contact the school supplies office to reschedule or visit your dashboard.
        </p>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Dashboard: <a href="${APP_BASE_URL}/dashboard" style="color: #2563eb;">${APP_BASE_URL}/dashboard</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          PHINMA University · This is an automated notification. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '⚠️ Missed Pickup — PHINMA SmartServe',
    html
  });
}

/**
 * Send a notification when a return request is confirmed (items returned).
 */
async function sendReturnConfirmed({ email, name, items }) {
  const itemsList = Array.isArray(items) && items.length > 0
    ? items.map(item => `<li style="margin: 4px 0; color: #334155;">${item.name || item.type || 'Item'} — <em>${item.condition || 'good'}</em></li>`).join('')
    : '<li style="color: #334155;">Returned items</li>';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 28px 32px; text-align: center;">
        <h1 style="color: #6ee7b7; margin: 0; font-size: 22px; letter-spacing: 0.5px;">PHINMA SMARTSERVE</h1>
        <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 14px;">Return Completed</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 10px;">
          Your return request has been <span style="color: #059669; font-weight: 700;">completed</span>. 
          The following items have been received:
        </p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          ${itemsList}
        </ul>
        <p style="color: #64748b; font-size: 14px; margin: 16px 0 0;">
          Thank you for returning your materials. View your return history:
          <a href="${APP_BASE_URL}/returns" style="color: #2563eb;">${APP_BASE_URL}/returns</a>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          PHINMA University · This is an automated notification. Please do not reply.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '✅ Return Completed — PHINMA SmartServe',
    html
  });
}

module.exports = {
  sendEmail,
  sendRegistrationApproved,
  sendRegistrationRejected,
  sendPickupReminder,
  sendNoShowNotification,
  sendReturnConfirmed
};

