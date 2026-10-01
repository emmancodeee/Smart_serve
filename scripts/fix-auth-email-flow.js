const fs = require('fs');

const path = 'services/authService.js';
let content = fs.readFileSync(path, 'utf8');

const oldVerification = `  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await upsertAuthCode(email, 'verification', code);

  const transporter = await initializeTransporter().catch(() => null);
  if (transporter) {
    const mailOptions = {
      from: '"Verification" <verify@example.com>',
      to: email,
      subject: 'Email Verification Code',
      html: \`
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>\${code}</h1>
        <p>This code will expire in 15 minutes.</p>
      \`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(\`Verification preview: \${preview}\`);
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }
  }`;

const newVerification = `  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = await initializeTransporter().catch(() => null);
  if (!transporter) {
    return { error: { status: 500, body: { error: 'Email service unavailable. Please try again later.' } } };
  }

  const mailOptions = {
    from: '"Verification" <verify@example.com>',
    to: email,
    subject: 'Email Verification Code',
    html: \`
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>\${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    \`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(\`Verification preview: \${preview}\`);
    await upsertAuthCode(email, 'verification', code);
  } catch (emailError) {
    console.error('Email error:', emailError.message);
    return { error: { status: 500, body: { error: 'Failed to send verification code. Please try again.' } } };
  }`;

const oldReset = `  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await upsertAuthCode(email, 'password_reset', code);

  const transporter = await initializeTransporter().catch(() => null);
  if (transporter) {
    const mailOptions = {
      from: '"Password Reset" <verify@example.com>',
      to: email,
      subject: 'Password Reset Code',
      html: \`
        <h2>Password Reset</h2>
        <p>Your password reset code is:</p>
        <h1>\${code}</h1>
        <p>This code will expire in 15 minutes.</p>
      \`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(\`Reset preview: \${preview}\`);
    } catch (emailError) {
      console.error('Reset email error:', emailError.message);
    }
  }`;

const newReset = `  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const transporter = await initializeTransporter().catch(() => null);
  if (!transporter) {
    return { error: { status: 500, body: { error: 'Email service unavailable. Please try again later.' } } };
  }

  const mailOptions = {
    from: '"Password Reset" <verify@example.com>',
    to: email,
    subject: 'Password Reset Code',
    html: \`
      <h2>Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1>\${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    \`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(\`Reset preview: \${preview}\`);
    await upsertAuthCode(email, 'password_reset', code);
  } catch (emailError) {
    console.error('Reset email error:', emailError.message);
    return { error: { status: 500, body: { error: 'Failed to send reset code. Please try again.' } } };
  }`;

if (!content.includes(oldVerification)) {
  throw new Error('Old verification block not found');
}

if (!content.includes(oldReset)) {
  throw new Error('Old reset block not found');
}

content = content.replace(oldVerification, newVerification);
content = content.replace(oldReset, newReset);
fs.writeFileSync(path, content);
