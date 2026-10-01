const sanitizeHtml = require('sanitize-html');

// Configure sanitize-html options
const sanitizeOptions = {
  allowedTags: [], // Strip all HTML tags
  allowedAttributes: {},
  allowedStyles: {},
};

/**
 * Sanitize a string input by removing all HTML tags
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Trim whitespace and sanitize HTML
  return sanitizeHtml(input.trim(), sanitizeOptions);
}

/**
 * Sanitize email input
 * @param {string} email - The email to sanitize
 * @returns {string} - Sanitized email
 */
function sanitizeEmail(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Trim whitespace and convert to lowercase
  return input.trim().toLowerCase();
}

/**
 * Sanitize password input
 * @param {string} password - The password to sanitize
 * @returns {string} - Sanitized password
 */
function sanitizePassword(input) {
  if (typeof input !== 'string') {
    return '';
  }
  // Trim whitespace
  return input.trim();
}

/**
 * Normalize OTP/auth codes to digits only
 * @param {string|number} input - The code to normalize
 * @returns {string} - Normalized code
 */
function normalizeAuthCode(input) {
  return String(input || '').replace(/\D/g, '').slice(0, 6);
}

/**
 * Normalize a password reset code. Unlike the registration OTP, the reset code
 * is not assumed to be a fixed number of digits, so any alphanumeric code is
 * accepted and only stripped of surrounding whitespace and separators.
 * @param {string|number} input - The reset code to normalize
 * @returns {string} - Normalized code
 */
function normalizeResetCode(input) {
  return String(input || '')
    .trim()
    .replace(/[\s-]+/g, '')
    .slice(0, 32);
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate age is a positive number
 * @param {number|string} age - The age to validate
 * @returns {boolean} - True if valid positive number
 */
function validateAge(age) {
  const num = Number(age);
  return !isNaN(num) && num > 0 && num < 150;
}

/**
 * Calculate age from birthday string/date
 * @param {string|Date} birthdayInput - birthday value
 * @returns {number|null} - Calculated age or null if invalid
 */
function calculateAgeFromBirthday(birthdayInput) {
  if (!birthdayInput) return null;

  const birthday = new Date(birthdayInput);
  if (isNaN(birthday.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  if (!validateAge(age)) return null;
  return age;
}

/**
 * Validate birthday is a valid past date
 * @param {string|Date} birthdayInput - birthday value
 * @returns {boolean} - True if valid birthday
 */
function validateBirthday(birthdayInput) {
  if (!birthdayInput) return false;
  const birthday = new Date(birthdayInput);
  if (isNaN(birthday.getTime())) return false;

  const today = new Date();
  return birthday <= today && calculateAgeFromBirthday(birthday) !== null;
}

/**
 * Validate student number format (alphanumeric)
 * @param {string} studentNumber - The student number to validate
 * @returns {boolean} - True if valid format
 */
function validateStudentNumber(studentNumber) {
  if (typeof studentNumber !== 'string') {
    return false;
  }
  // Must be digits only, start with "01", and be 5-12 digits long
  const studentNumberRegex = /^01\d{3,10}$/;
  return studentNumberRegex.test(studentNumber);
}

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid and message
 */
function validatePassword(password) {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one uppercase letter' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must include at least one number' };
  }
  
  return { isValid: true, message: 'Password is valid' };
}

/**
 * Validate name format
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid format
 */
function validateName(name) {
  if (typeof name !== 'string') {
    return false;
  }
  // Allow letters, spaces, hyphens, and apostrophes, 2-100 characters
  const nameRegex = /^[a-zA-Z\s'-]{2,100}$/;
  return nameRegex.test(name.trim());
}

/**
 * Sanitize and validate all user registration input
 * @param {object} userData - The user data to sanitize and validate
 * @returns {object} - Sanitized data and validation errors
 */
function sanitizeRegistrationInput(userData) {
  const errors = [];
  const sanitized = {};
  
  // Sanitize and validate first name
  if (userData.firstName) {
    sanitized.firstName = sanitizeString(userData.firstName);
    if (!validateName(sanitized.firstName)) {
      errors.push('First name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes');
    }
  } else {
    errors.push('First name is required');
  }
  
  // Sanitize and validate middle name (optional)
  if (userData.middleName) {
    sanitized.middleName = sanitizeString(userData.middleName);
    if (!validateName(sanitized.middleName)) {
      errors.push('Middle name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes');
    }
  } else {
    sanitized.middleName = '';
  }
  
  // Sanitize and validate last name
  if (userData.lastName) {
    sanitized.lastName = sanitizeString(userData.lastName);
    if (!validateName(sanitized.lastName)) {
      errors.push('Last name must be 2-100 characters and contain only letters, spaces, hyphens, or apostrophes');
    }
  } else {
    errors.push('Last name is required');
  }
  
  // Build full name for backward compatibility
  sanitized.name = `${sanitized.firstName} ${sanitized.middleName} ${sanitized.lastName}`.trim();
  
  // Sanitize and validate email (must be @phinmaed.com)
  if (userData.email) {
    sanitized.email = sanitizeEmail(userData.email);
    if (!validateEmail(sanitized.email)) {
      errors.push('Invalid email format');
    }
    if (!sanitized.email.endsWith('@phinmaed.com')) {
      errors.push('Email must be your school email (@phinmaed.com)');
    }
  } else {
    errors.push('Email is required');
  }
  
  // Sanitize and validate student number
  if (userData.studentNumber) {
    sanitized.studentNumber = sanitizeString(userData.studentNumber);
    if (!validateStudentNumber(sanitized.studentNumber)) {
      errors.push('Student number must start with 01 and contain 5-12 digits');
    }
  } else {
    errors.push('Student number is required');
  }
  
  // Validate birthday (source of truth for age)
  if (userData.birthday) {
    if (!validateBirthday(userData.birthday)) {
      errors.push('Birthday must be a valid past date');
    } else {
      const birthday = new Date(userData.birthday);
      birthday.setHours(0, 0, 0, 0);
      sanitized.birthday = birthday;
      sanitized.age = calculateAgeFromBirthday(birthday);
    }
  } else {
    errors.push('Birthday is required');
  }
  
  // Sanitize password (don't store sanitized, just validate)
  if (userData.password) {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message);
    }
    sanitized.password = sanitizePassword(userData.password);
  } else {
    errors.push('Password is required');
  }
  
  // Sanitize confirm password
  if (userData.confirmPassword) {
    sanitized.confirmPassword = sanitizePassword(userData.confirmPassword);
  } else {
    errors.push('Confirm password is required');
  }
  
  // Sanitize verification code
  if (userData.verificationCode) {
    sanitized.verificationCode = normalizeAuthCode(userData.verificationCode);
  } else if (userData.captchaAnswer) {
    sanitized.verificationCode = normalizeAuthCode(userData.captchaAnswer);
  } else {
    errors.push('Verification code is required');
  }
  
  return { sanitized, errors };
}

/**
 * Sanitize inventory input
 * @param {object} inventoryData - The inventory data to sanitize
 * @returns {object} - Sanitized data and validation errors
 */
function sanitizeInventoryInput(inventoryData) {
  const errors = [];
  const sanitized = {};
  
  // Sanitize and validate itemName
  if (inventoryData.itemName) {
    sanitized.itemName = sanitizeString(inventoryData.itemName);
    if (sanitized.itemName.length < 1) {
      errors.push('Item name is required');
    }
  } else {
    errors.push('Item name is required');
  }
  
  // Sanitize and validate category
  if (inventoryData.category) {
    sanitized.category = sanitizeString(inventoryData.category);
    if (sanitized.category.length < 1) {
      errors.push('Category is required');
    }
  } else {
    errors.push('Category is required');
  }
  
  // Validate quantity
  if (inventoryData.quantity !== undefined) {
    const quantity = Number(inventoryData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      errors.push('Quantity must be a positive number');
    } else {
      sanitized.quantity = quantity;
    }
  } else {
    errors.push('Quantity is required');
  }
  
  // Validate unitOfMeasure
  const validUnits = ['pcs', 'sets', 'reams', 'copies', 'boxes', 'other'];
  if (inventoryData.unitOfMeasure) {
    const uom = sanitizeString(inventoryData.unitOfMeasure).toLowerCase();
    if (validUnits.includes(uom)) {
      sanitized.unitOfMeasure = uom;
    } else {
      errors.push('Unit of measure must be one of: pcs, sets, reams, copies, boxes, other');
    }
  } else {
    sanitized.unitOfMeasure = 'pcs';
  }
  
  // Validate reorderLevel
  if (inventoryData.reorderLevel !== undefined) {
    const reorderLevel = Number(inventoryData.reorderLevel);
    if (isNaN(reorderLevel) || reorderLevel < 0) {
      errors.push('Reorder level must be a positive number');
    } else {
      sanitized.reorderLevel = reorderLevel;
    }
  }
  
  return { sanitized, errors };
}

/**
 * Sanitize supply input
 * @param {object} supplyData - The supply data to sanitize
 * @returns {object} - Sanitized data and validation errors
 */
function sanitizeSupplyInput(supplyData) {
  const errors = [];
  const sanitized = {};

  if (supplyData.itemName) {
    sanitized.itemName = sanitizeString(supplyData.itemName);
    if (sanitized.itemName.length < 1) {
      errors.push('Item name is required');
    }
  } else {
    errors.push('Item name is required');
  }

  if (supplyData.category) {
    sanitized.category = sanitizeString(supplyData.category);
    if (sanitized.category.length < 1) {
      errors.push('Category is required');
    }
  } else {
    errors.push('Category is required');
  }

  if (supplyData.quantity !== undefined) {
    const quantity = Number(supplyData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      errors.push('Quantity must be a positive number');
    } else {
      sanitized.quantity = Math.floor(quantity);
    }
  } else {
    errors.push('Quantity is required');
  }

  if (supplyData.notes !== undefined) {
    sanitized.notes = sanitizeString(supplyData.notes);
  }

  return { sanitized, errors };
}

/**
 * Sanitize stock-out input
 * @param {object} stockOutData - The stock-out data to sanitize
 * @returns {object} - Sanitized data and validation errors
 */
function sanitizeStockOutInput(stockOutData) {
  const errors = [];
  const sanitized = {};

  if (stockOutData.inventoryId) {
    sanitized.inventoryId = sanitizeString(stockOutData.inventoryId);
    if (sanitized.inventoryId.length < 1) {
      errors.push('Inventory item is required');
    }
  } else {
    errors.push('Inventory item is required');
  }

  if (stockOutData.quantity !== undefined) {
    const quantity = Number(stockOutData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      errors.push('Quantity must be a positive number');
    } else {
      sanitized.quantity = Math.floor(quantity);
    }
  } else {
    errors.push('Quantity is required');
  }

  const validReasons = ['Damaged', 'Expired', 'Disposed', 'Manual Adjustment'];
  if (stockOutData.reason) {
    sanitized.reason = sanitizeString(stockOutData.reason);
    if (!validReasons.includes(sanitized.reason)) {
      errors.push('Reason must be one of: Damaged, Expired, Disposed, Manual Adjustment');
    }
  } else {
    errors.push('Reason is required');
  }

  if (stockOutData.notes !== undefined) {
    sanitized.notes = sanitizeString(stockOutData.notes);
  }

  return { sanitized, errors };
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePassword,
  normalizeAuthCode,
  normalizeResetCode,
  validateEmail,
  validateAge,
  validateBirthday,
  calculateAgeFromBirthday,
  validateStudentNumber,
  validatePassword,
  validateName,
  sanitizeRegistrationInput,
  sanitizeInventoryInput,
  sanitizeSupplyInput,
  sanitizeStockOutInput,
};
