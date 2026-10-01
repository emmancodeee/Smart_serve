const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const loginSection = document.getElementById('loginSection');
const forgotSection = document.getElementById('forgotSection');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const resendCodeLink = document.getElementById('resendCodeLink');
const resetStepFields = document.getElementById('resetStepFields');
const resetStepHint = document.getElementById('resetStepHint');
const resetCodeSentHint = document.getElementById('resetCodeSentHint');
const resetCodeEmailLabel = document.getElementById('resetCodeEmailLabel');
const resetEmailInput = document.getElementById('resetEmail');
const resetCodeInput = document.getElementById('resetCode');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

function normalizeOtp(value) {
  return String(value || '').trim().replace(/[\s-]+/g, '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============== Toast Notification System ==============

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" type="button" aria-label="Dismiss notification">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showMessage(text, type = 'error') {
  messageDiv.textContent = text;
  messageDiv.style.color = type === 'success' ? 'green' : 'red';
}

function clearMessage() {
  messageDiv.textContent = '';
}

function isReasonableToken(token) {
  const value = String(token || '').trim();
  if (!value) return false;
  if (value.length > 4096) return false;
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);
}

function resetForgotPasswordForm() {
  forgotPasswordForm?.reset();
  resetStepFields?.classList.add('hidden');
  resetStepHint?.classList.remove('hidden');
  resetCodeSentHint?.classList.add('hidden');
}

function openResetStep(email) {
  if (resetCodeEmailLabel) {
    resetCodeEmailLabel.textContent = email;
  }
  resetStepFields?.classList.remove('hidden');
  resetStepHint?.classList.add('hidden');
  resetCodeSentHint?.classList.remove('hidden');
  resetCodeInput?.focus();
}

forgotPasswordLink?.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  loginSection.classList.add('hidden');
  forgotSection.classList.remove('hidden');
});

backToLoginLink?.addEventListener('click', (e) => {
  e.preventDefault();
  clearMessage();
  resetForgotPasswordForm();
  forgotSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
});

resetCodeInput?.addEventListener('input', (e) => {
  e.target.value = normalizeOtp(e.target.value);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginButton = loginForm.querySelector('button[type="submit"]');
  // Ignore Enter/clicks while a sign-in is already in flight.
  if (loginButton?.disabled) return;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (loginButton) {
    loginButton.disabled = true;
    loginButton.setAttribute('aria-busy', 'true');
  }
  let signedIn = false;
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log('Login response data:', data);
      console.log('Token received:', data.token ? 'Yes' : 'No');
      console.log('Token validation check:', isReasonableToken(data.token) ? 'Pass' : 'Fail');
      
      if (!isReasonableToken(data.token)) {
        console.error('Token validation failed');
        showMessage('Received an invalid sign-in token. Please try again.');
        localStorage.removeItem('token');
        return;
      }
      showMessage('Sign in successful!', 'success');
      localStorage.setItem('token', data.token);
      console.log('Token stored in localStorage');
      
      if (data.isAdmin) {
        localStorage.setItem('smartserve_admin_profile', JSON.stringify({
          name: data.name || 'Admin',
          email: data.email || '',
          accountType: data.accountType,
          isAdmin: Boolean(data.isAdmin),
          isSuperAdmin: Boolean(data.isSuperAdmin)
        }));
      } else {
        localStorage.setItem('smartserve_student_profile', JSON.stringify({
          name: String(data.name || '').trim(),
          fullname: String(data.name || '').trim(),
          firstName: String(data.firstName || '').trim(),
          email: String(data.email || '').trim()
        }));
      }
      signedIn = true;
      if (data.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      showMessage(data.error || 'Sign in failed');
    }
  } catch (error) {
    showMessage('An error occurred');
  } finally {
    // Stay disabled while the browser navigates away after a successful sign-in.
    if (loginButton && !signedIn) {
      loginButton.disabled = false;
      loginButton.removeAttribute('aria-busy');
    }
  }
});

async function requestResetCode() {
  // Enter in the email field and "Resend code" bypass the disabled button.
  if (sendResetCodeBtn.disabled) return;
  const email = resetEmailInput.value.trim();
  if (!email) {
    showMessage('Please enter your email address');
    resetEmailInput.focus();
    return;
  }
  if (!resetEmailInput.checkValidity()) {
    resetEmailInput.reportValidity();
    return;
  }

  sendResetCodeBtn.disabled = true;
  const originalLabel = sendResetCodeBtn.textContent;
  sendResetCodeBtn.textContent = 'Sending...';
  clearMessage();


  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    console.log('Forgot password response status:', response.status);
    const data = await response.json().catch(() => ({}));
    console.log('Forgot password response data:', data);
    
    if (!response.ok) {
      const reason = data.error || 'Failed to send reset code';
      showMessage(reason);
      showToast(reason, 'error');
      return;
    }

    showMessage(data.message || 'Reset code sent', 'success');
    showToast(`Reset code sent to ${email}. Please check your inbox.`, 'success');
    openResetStep(email);
  } catch (error) {
    console.error('Forgot password error:', error);
    showMessage('An error occurred while requesting reset code');
    showToast('An error occurred while requesting reset code', 'error');
  } finally {
    sendResetCodeBtn.disabled = false;
    sendResetCodeBtn.textContent = originalLabel;
  }
}

sendResetCodeBtn?.addEventListener('click', requestResetCode);
resendCodeLink?.addEventListener('click', (e) => {
  e.preventDefault();
  requestResetCode();
});

resetEmailInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    requestResetCode();
  }
});

// The reset fields sit in a form without a submit button, so Enter did
// nothing there; run the step's primary action like the email field does.
[resetCodeInput, newPasswordInput, confirmNewPasswordInput].forEach(input => {
  input?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    if (!resetPasswordBtn.disabled) resetPasswordBtn.click();
  });
});

resetPasswordBtn?.addEventListener('click', async () => {
  const email = resetEmailInput.value.trim();
  const code = normalizeOtp(resetCodeInput.value);
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmNewPasswordInput.value;

  if (!code) {
    showMessage('Please enter the reset code from your email');
    return;
  }
  if (!newPassword || !confirmPassword) {
    showMessage('Please enter and confirm your new password');
    return;
  }
  if (newPassword !== confirmPassword) {
    showMessage('Passwords do not match');
    return;
  }

  resetPasswordBtn.disabled = true;
  const originalLabel = resetPasswordBtn.textContent;
  resetPasswordBtn.textContent = 'Resetting...';
  clearMessage();

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, confirmPassword }),
    });

    console.log('Reset password response status:', response.status);
    const data = await response.json().catch(() => ({}));
    console.log('Reset password response data:', data);
    
    if (!response.ok) {
      showMessage(data.error || 'Failed to reset password');
      showToast(data.error || 'Failed to reset password', 'error');
      return;
    }

    showMessage(data.message || 'Password reset successful', 'success');
    showToast('Password reset successful. You can now sign in.', 'success');
    resetForgotPasswordForm();
    forgotSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
  } catch (error) {
    console.error('Reset password error:', error);
    showMessage('An error occurred while resetting password');
    showToast('An error occurred while resetting password', 'error');
  } finally {
    resetPasswordBtn.disabled = false;
    resetPasswordBtn.textContent = originalLabel;
  }
});
