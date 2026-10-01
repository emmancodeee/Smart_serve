// ---------------------------------------------------------------------------
// UI kit: toasts, confirmation / input dialogs and a busy-button guard.
//
// Shared by every signed-in page (admin and student), next to app-shell.js.
// Replaces window.alert/confirm/prompt, which block the page and cannot be
// styled, and gives every action the same feedback:
//
//   UIKit.toast('Saved', 'success' | 'error' | 'warning' | 'info')
//   await UIKit.confirm({ title, message, confirmText, tone: 'danger' })  -> boolean
//   await UIKit.prompt({ title, message, label, minLength, multiline,
//                        options: [{ value, label }], defaultValue })     -> string | null
//   await UIKit.withBusy(button, async () => { ... }, { busyText })
//
// withBusy ignores clicks while the task runs, which is what prevents
// duplicate submissions. Styles live in app-shell.css.
// ---------------------------------------------------------------------------
(function (global) {
  'use strict';

  let toastRegion = null;

  function getToastRegion() {
    if (toastRegion && document.body.contains(toastRegion)) return toastRegion;
    toastRegion = document.createElement('div');
    toastRegion.className = 'ui-toast-region';
    toastRegion.setAttribute('role', 'status');
    toastRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastRegion);
    return toastRegion;
  }

  function toast(message, type = 'success', { duration = 4200 } = {}) {
    const item = document.createElement('div');
    item.className = `ui-toast ui-toast--${type}`;

    const text = document.createElement('span');
    text.className = 'ui-toast-message';
    text.textContent = String(message || '');

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'ui-toast-close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';

    const dismiss = () => {
      item.classList.add('is-leaving');
      setTimeout(() => item.remove(), 200);
    };
    close.addEventListener('click', dismiss);

    item.append(text, close);
    getToastRegion().appendChild(item);
    if (duration > 0) setTimeout(dismiss, duration);
    return dismiss;
  }

  // One dialog at a time; resolves with { confirmed, value }.
  function openDialog({
    title = 'Are you sure?',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    tone = 'primary',
    input = null
  } = {}) {
    return new Promise(resolve => {
      const previousFocus = document.activeElement;
      const backdrop = document.createElement('div');
      backdrop.className = 'ui-dialog-backdrop';

      const dialog = document.createElement('div');
      dialog.className = 'ui-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      const titleId = `ui-dialog-title-${Date.now()}`;
      dialog.setAttribute('aria-labelledby', titleId);

      const heading = document.createElement('h2');
      heading.className = 'ui-dialog-title';
      heading.id = titleId;
      heading.textContent = title;
      dialog.appendChild(heading);

      if (message) {
        const body = document.createElement('p');
        body.className = 'ui-dialog-message';
        body.textContent = message;
        dialog.appendChild(body);
      }

      let field = null;
      let error = null;
      if (input) {
        const fieldId = `ui-dialog-field-${Date.now()}`;
        if (input.label) {
          const label = document.createElement('label');
          label.className = 'ui-dialog-label';
          label.htmlFor = fieldId;
          label.textContent = input.label;
          dialog.appendChild(label);
        }
        if (Array.isArray(input.options)) {
          field = document.createElement('select');
          input.options.forEach(option => {
            const node = document.createElement('option');
            node.value = option.value;
            node.textContent = option.label;
            field.appendChild(node);
          });
        } else {
          field = document.createElement(input.multiline ? 'textarea' : 'input');
          if (input.multiline) field.rows = 3;
          else field.type = 'text';
          if (input.placeholder) field.placeholder = input.placeholder;
        }
        field.id = fieldId;
        field.className = 'ui-dialog-field';
        if (input.defaultValue != null) field.value = String(input.defaultValue);
        dialog.appendChild(field);

        error = document.createElement('p');
        error.className = 'ui-dialog-error';
        error.hidden = true;
        dialog.appendChild(error);
      }

      const actions = document.createElement('div');
      actions.className = 'ui-dialog-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'ui-btn ui-btn--ghost';
      cancelBtn.textContent = cancelText;
      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = `ui-btn ui-btn--${tone === 'danger' ? 'danger' : 'primary'}`;
      confirmBtn.textContent = confirmText;
      actions.append(cancelBtn, confirmBtn);
      dialog.appendChild(actions);

      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);

      const close = result => {
        document.removeEventListener('keydown', onKey, true);
        backdrop.remove();
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
        resolve(result);
      };

      const submit = () => {
        if (!field) {
          close({ confirmed: true, value: null });
          return;
        }
        const value = String(field.value || '').trim();
        const minLength = Number(input.minLength) || (input.required ? 1 : 0);
        if (value.length < minLength) {
          error.textContent = minLength > 1
            ? `Please enter at least ${minLength} characters.`
            : 'This field is required.';
          error.hidden = false;
          field.focus();
          return;
        }
        close({ confirmed: true, value });
      };

      function onKey(event) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close({ confirmed: false, value: null });
        } else if (event.key === 'Enter' && field && field.tagName === 'INPUT') {
          event.preventDefault();
          submit();
        } else if (event.key === 'Tab') {
          // Keep focus inside the dialog.
          const focusable = dialog.querySelectorAll('button, input, select, textarea');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      cancelBtn.addEventListener('click', () => close({ confirmed: false, value: null }));
      confirmBtn.addEventListener('click', submit);
      backdrop.addEventListener('click', event => {
        if (event.target === backdrop) close({ confirmed: false, value: null });
      });
      document.addEventListener('keydown', onKey, true);
      (field || confirmBtn).focus();
    });
  }

  async function confirm(options) {
    const result = await openDialog(options);
    return result.confirmed;
  }

  async function prompt(options = {}) {
    const { label, placeholder, minLength, required, multiline, options: choices, defaultValue, ...rest } = options;
    const result = await openDialog({
      ...rest,
      input: { label, placeholder, minLength, required, multiline, options: choices, defaultValue }
    });
    return result.confirmed ? result.value : null;
  }

  // Runs task() with the button disabled and marked busy. A second click while
  // it runs is ignored, so the same request can never be sent twice.
  async function withBusy(button, task, { busyText } = {}) {
    if (!button) return task();
    if (button.dataset.busy === 'true') return undefined;
    const originalHtml = button.innerHTML;
    const wasDisabled = button.disabled;
    button.dataset.busy = 'true';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('is-busy');
    if (busyText) button.textContent = busyText;
    try {
      return await task();
    } finally {
      button.dataset.busy = 'false';
      button.disabled = wasDisabled;
      button.removeAttribute('aria-busy');
      button.classList.remove('is-busy');
      if (busyText) button.innerHTML = originalHtml;
    }
  }

  global.UIKit = { toast, confirm, prompt, withBusy };
})(window);
