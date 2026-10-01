const REGISTER_PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const STUDENT_NUMBER_RULE = /^01\d{3,10}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let registerForm;
let sendCodeBtn;
let verifyCodeBtn;
let agePreview;
let registerSection;
let otpSection;
let backToRegisterLink;
let birthMonthSelect;
let birthDaySelect;
let birthYearSelect;
let registerMessageDiv;
let otpMessageDiv;
let otpEmailLabel;
let resendCodeBtn;
// Button labels as written in register.html, captured on load so every reset
// puts back exactly that markup (the "Request OTP" arrow is a child span).
let sendCodeBtnLabel = '';
let verifyCodeBtnLabel = '';
let resendCodeBtnLabel = '';

function normalizeOtp(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
}

function calculateAgeFromBirthday(birthdayValue) {
  if (!birthdayValue) return null;

  const birthday = new Date(`${birthdayValue}T00:00:00`);
  if (Number.isNaN(birthday.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  if (age < 0 || age > 150) return null;
  return age;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getBirthdayFromSelects() {
  const month = Number(birthMonthSelect?.value);
  const day = Number(birthDaySelect?.value);
  const year = Number(birthYearSelect?.value);
  if (!month || !day || !year) return '';
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function fillDayOptions(maxDays, selectedDay = '') {
  if (!birthDaySelect) return;
  birthDaySelect.innerHTML = '<option value="">Day</option>';
  for (let d = 1; d <= maxDays; d++) {
    const option = document.createElement('option');
    option.value = String(d);
    option.textContent = String(d);
    if (String(d) === String(selectedDay)) option.selected = true;
    birthDaySelect.appendChild(option);
  }
}

function updateBirthdayPreview() {
  if (!agePreview) return;
  const birthday = getBirthdayFromSelects();
  const age = calculateAgeFromBirthday(birthday);
  agePreview.textContent = age === null ? 'Age: -' : `Age: ${age}`;
}

function initializeBirthdaySelects() {
  birthMonthSelect = document.getElementById('birthMonth');
  birthDaySelect = document.getElementById('birthDay');
  birthYearSelect = document.getElementById('birthYear');
  if (!birthMonthSelect || !birthDaySelect || !birthYearSelect) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  monthNames.forEach((name, index) => {
    const option = document.createElement('option');
    option.value = String(index + 1);
    option.textContent = name;
    birthMonthSelect.appendChild(option);
  });

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 100; year--) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    birthYearSelect.appendChild(option);
  }

  fillDayOptions(31);

  const onMonthOrYearChange = () => {
    const month = Number(birthMonthSelect.value) || 1;
    const year = Number(birthYearSelect.value) || currentYear;
    const currentDay = birthDaySelect.value;
    const maxDays = daysInMonth(year, month);
    fillDayOptions(maxDays, currentDay);
    updateBirthdayPreview();
  };

  birthMonthSelect.addEventListener('change', onMonthOrYearChange);
  birthYearSelect.addEventListener('change', onMonthOrYearChange);
  birthDaySelect.addEventListener('change', updateBirthdayPreview);
}

function getFormValues() {
  const email = String(document.getElementById('email')?.value || '').trim().toLowerCase();
  const password = String(document.getElementById('password')?.value || '');
  const confirmPassword = String(document.getElementById('confirmPassword')?.value || '');
  const firstName = String(document.getElementById('firstName')?.value || '').trim();
  const middleName = String(document.getElementById('middleName')?.value || '').trim();
  const lastName = String(document.getElementById('lastName')?.value || '').trim();
  const birthday = getBirthdayFromSelects();
  const age = calculateAgeFromBirthday(birthday);
  const studentNumber = String(document.getElementById('studentNumber')?.value || '').trim();
  const verificationCode = normalizeOtp(document.getElementById('captchaAnswer')?.value || '');

  return {
    firstName,
    middleName,
    lastName,
    email,
    password,
    confirmPassword,
    birthday,
    age,
    studentNumber,
    verificationCode
  };
}

function clearMessage(scope = 'all') {
  if ((scope === 'all' || scope === 'register') && registerMessageDiv) {
    registerMessageDiv.textContent = '';
    registerMessageDiv.className = 'auth-message hidden';
  }
  if ((scope === 'all' || scope === 'otp') && otpMessageDiv) {
    otpMessageDiv.textContent = '';
    otpMessageDiv.className = 'auth-message hidden';
  }
}

function showMessage(message, type = 'error', scope = 'register') {
  const target = scope === 'otp' ? otpMessageDiv : registerMessageDiv;
  if (!target) return;
  target.textContent = message;
  target.className = `auth-message ${type}`;
}

function validateRegistrationFields(values) {
  if (!values.firstName || !values.lastName || !values.email || !values.password || !values.confirmPassword || !values.birthday || !values.studentNumber) {
    return 'Please fill in all required fields (First Name, Last Name, Email, Password, Birthday, Student Number)';
  }

  if (!EMAIL_RULE.test(values.email)) {
    return 'Please enter a valid email address';
  }

  if (!STUDENT_NUMBER_RULE.test(values.studentNumber)) {
    return 'Student number must start with 01 and contain 5-12 digits';
  }

  if (values.age === null) {
    return 'Please enter a valid birthday';
  }

  if (values.password !== values.confirmPassword) {
    return 'Passwords do not match';
  }

  if (!REGISTER_PASSWORD_RULE.test(values.password)) {
    return 'Password must be 8-128 characters and include uppercase, lowercase, and a number';
  }

  return '';
}

function setOtpSection(email) {
  if (otpEmailLabel) {
    otpEmailLabel.textContent = email ? `Enter the 6-digit code sent to ${email}:` : 'Enter the 6-digit code sent to your email:';
  }
  otpSection?.classList.remove('hidden');
  registerSection?.classList.add('hidden');
  document.getElementById('captchaAnswer')?.focus();
}

function setRegisterSection() {
  clearMessage('all');
  otpSection?.classList.add('hidden');
  registerSection?.classList.remove('hidden');
}

async function requestOtp(email) {
  const response = await fetch('/api/auth/send-verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function handleSendOTP() {
  if (sendCodeBtn.disabled) return;
  clearMessage('all');
  const values = getFormValues();
  const validationError = validateRegistrationFields(values);
  if (validationError) {
    showMessage(validationError, 'error', 'register');
    return;
  }

  try {
    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = 'Sending...';

    const { response, data } = await requestOtp(values.email);

    if (!response.ok) {
      showMessage(data.error || 'Failed to send verification code', 'error', 'register');
      return;
    }

    setOtpSection(values.email);
    showMessage(data.message || 'Verification code sent successfully.', 'success', 'otp');
  } catch (error) {
    console.error('Error sending OTP:', error);
    showMessage('An error occurred while sending the OTP. Please try again.', 'error', 'register');
  } finally {
    sendCodeBtn.disabled = false;
    sendCodeBtn.innerHTML = sendCodeBtnLabel;
  }
}

async function handleResendOTP() {
  if (resendCodeBtn?.disabled) return;
  clearMessage('otp');
  const values = getFormValues();
  const validationError = validateRegistrationFields(values);
  if (validationError) {
    setRegisterSection();
    showMessage(validationError, 'error', 'register');
    return;
  }

  try {
    if (resendCodeBtn) {
      resendCodeBtn.disabled = true;
      resendCodeBtn.textContent = 'Sending...';
    }

    const { response, data } = await requestOtp(values.email);
    if (!response.ok) {
      showMessage(data.error || 'Failed to resend verification code', 'error', 'otp');
      return;
    }

    showMessage(data.message || 'A new verification code was sent.', 'success', 'otp');
  } catch (error) {
    console.error('Error resending OTP:', error);
    showMessage('An error occurred while resending the OTP. Please try again.', 'error', 'otp');
  } finally {
    if (resendCodeBtn) {
      resendCodeBtn.disabled = false;
      resendCodeBtn.innerHTML = resendCodeBtnLabel;
    }
  }
}

async function handleVerifyOTP() {
  if (verifyCodeBtn.disabled) return;
  clearMessage('otp');
  const values = getFormValues();
  const registrationError = validateRegistrationFields(values);
  if (registrationError) {
    setRegisterSection();
    showMessage(registrationError, 'error', 'register');
    return;
  }

  if (values.verificationCode.length !== 6) {
    showMessage('OTP must be exactly 6 digits', 'error', 'otp');
    return;
  }

  let registered = false;
  try {
    verifyCodeBtn.disabled = true;
    verifyCodeBtn.textContent = 'Registering...';

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.error || 'Registration failed', 'error', 'otp');
      return;
    }

    registered = true;
    showMessage(data.message || 'Sign up successful. You can now sign in.', 'success', 'otp');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } catch (error) {
    console.error('Error signing up:', error);
    showMessage('An error occurred while completing sign up. Please try again.', 'error', 'otp');
  } finally {
    // After a successful sign-up the page redirects to the login screen; keep
    // the button disabled until then so the account is not submitted twice.
    if (!registered) {
      verifyCodeBtn.disabled = false;
      verifyCodeBtn.innerHTML = verifyCodeBtnLabel;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  registerForm = document.getElementById('registerForm');
  sendCodeBtn = document.getElementById('sendCodeBtn');
  verifyCodeBtn = document.getElementById('verifyCodeBtn');
  registerSection = document.getElementById('registerSection');
  otpSection = document.getElementById('otpSection');
  backToRegisterLink = document.getElementById('backToRegisterLink');
  agePreview = document.getElementById('agePreview');
  registerMessageDiv = document.getElementById('registerMessage');
  otpMessageDiv = document.getElementById('otpMessage');
  otpEmailLabel = document.getElementById('otpEmailLabel');
  resendCodeBtn = document.getElementById('resendCodeBtn');

  const otpInput = document.getElementById('captchaAnswer');
  const studentNumberInput = document.getElementById('studentNumber');
  const emailInput = document.getElementById('email');

  if (!sendCodeBtn || !verifyCodeBtn) {
    console.error('Registration controls not found');
    return;
  }

  sendCodeBtnLabel = sendCodeBtn.innerHTML;
  verifyCodeBtnLabel = verifyCodeBtn.innerHTML;
  resendCodeBtnLabel = resendCodeBtn ? resendCodeBtn.innerHTML : '';

  sendCodeBtn.addEventListener('click', handleSendOTP);
  verifyCodeBtn.addEventListener('click', handleVerifyOTP);
  resendCodeBtn?.addEventListener('click', handleResendOTP);

  // The form has no submit button (its primary action is a type="button" so
  // it can run validation first), which means the browser never submits it on
  // Enter. Map Enter in a field to the current step's primary action instead.
  registerForm?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    if (!event.target.matches('input, select')) return;
    event.preventDefault();
    handleSendOTP();
  });
  otpInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    handleVerifyOTP();
  });

  otpInput?.addEventListener('input', () => {
    otpInput.value = normalizeOtp(otpInput.value);
  });

  studentNumberInput?.addEventListener('input', () => {
    studentNumberInput.value = String(studentNumberInput.value || '').replace(/\D/g, '').slice(0, 12);
  });

  emailInput?.addEventListener('input', () => clearMessage('all'));
  registerForm?.addEventListener('input', () => clearMessage('register'));

  backToRegisterLink?.addEventListener('click', event => {
    event.preventDefault();
    setRegisterSection();
  });

  initializeBirthdaySelects();
  updateBirthdayPreview();
});
