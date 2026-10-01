(function () {
  'use strict';

  var TARGET_IDS = [
    'password',
    'confirmPassword',
    'newPassword',
    'confirmNewPassword',
    'oldPassword',
    'adminOldPassword',
    'adminNewPassword',
    'adminConfirmNewPassword',
    'newAdminPassword'
  ];

  var STYLE_ID = 'show-password-styles';

  var EYE_SVG =
    '<svg class="pw-toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />' +
    '</svg>';

  var EYE_SLASH_SVG =
    '<svg class="pw-toggle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />' +
    '</svg>';

  var PW_STYLES = [
    '.pw-field{position:relative;display:block;}',
    '.pw-field .pw-toggle{position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);-webkit-transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;min-width:2.25rem;max-width:2.25rem;min-height:2.25rem;max-height:2.25rem;padding:0;margin:0;border:none;border-radius:0.5rem;background:transparent;color:#64748b;cursor:pointer;font-size:0;line-height:0;box-shadow:none;filter:none;overflow:hidden;-webkit-appearance:none;appearance:none;}',
    '.pw-field .pw-toggle:hover{transform:translateY(-50%);-webkit-transform:translateY(-50%);background:rgba(100,116,139,0.08);color:#334155;filter:none;}',
    '.pw-field .pw-toggle:active{color:#0f172a;}',
    '.pw-field .pw-toggle:focus{outline:none;box-shadow:none;}',
    '.pw-field .pw-toggle:focus-visible{outline:none;box-shadow:0 0 0 2px #ffffff,0 0 0 3px #3b82f6;background:rgba(100,116,139,0.08);}',
    '.pw-field .pw-toggle-icon{width:1.25rem;height:1.25rem;pointer-events:none;display:block;}',
    '#loginForm .pw-field .pw-toggle{width:2.25rem !important;max-width:2.25rem !important;padding:0 !important;}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = PW_STYLES;
    (document.head || document.documentElement).appendChild(style);
  }

  function enhance(input) {
    if (!input || input.getAttribute('data-pw-enhanced') === 'true') {
      return;
    }
    if (input.type !== 'password') {
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'pw-field';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pw-toggle';

    var visible = false;

    function render() {
      button.innerHTML = visible ? EYE_SLASH_SVG : EYE_SVG;
      button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
      button.setAttribute('title', visible ? 'Hide password' : 'Show password');
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      visible = !visible;
      input.type = visible ? 'text' : 'password';
      render();
      input.focus();
    });

    render();
    wrapper.appendChild(button);

    input.setAttribute('data-pw-enhanced', 'true');
    input.style.paddingRight = '2.75rem';
  }

  function init() {
    injectStyles();
    TARGET_IDS.forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        enhance(input);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();