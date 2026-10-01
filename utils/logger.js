const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const ERROR_FILE = path.join(LOG_DIR, 'error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const currentLogLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');

function shouldLog(level) {
  const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
  const currentIndex = levels.indexOf(level);
  const configIndex = levels.indexOf(currentLogLevel);
  return currentIndex <= configIndex;
}

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaStr}`;
}

function writeToFile(filePath, message) {
  try {
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

function log(level, message, meta = {}) {
  if (!shouldLog(level)) return;

  const formattedMessage = formatLog(level, message, meta);
  
  // Always log to console
  if (level === LOG_LEVELS.ERROR) {
    console.error(formattedMessage);
  } else if (level === LOG_LEVELS.WARN) {
    console.warn(formattedMessage);
  } else {
    console.log(formattedMessage);
  }

  // Write to appropriate log file
  if (level === LOG_LEVELS.ERROR) {
    writeToFile(ERROR_FILE, formattedMessage);
  } else {
    writeToFile(LOG_FILE, formattedMessage);
  }
}

const logger = {
  error: (message, meta) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta) => log(LOG_LEVELS.DEBUG, message, meta),
  
  // Convenience methods
  request: (req, meta = {}) => {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      ...meta
    };
    logger.info('HTTP Request', logData);
  },
  
  response: (req, res, meta = {}) => {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: res.responseTime,
      ...meta
    };
    logger.info('HTTP Response', logData);
  },
  
  errorResponse: (req, res, error, meta = {}) => {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      error: error.message,
      stack: error.stack,
      ...meta
    };
    logger.error('HTTP Error Response', logData);
  },
  
  database: (operation, collection, meta = {}) => {
    const logData = {
      operation,
      collection,
      ...meta
    };
    logger.debug('Database Operation', logData);
  },
  
  auth: (action, userId, meta = {}) => {
    const logData = {
      action,
      userId,
      ...meta
    };
    logger.info('Auth Event', logData);
  }
};

module.exports = logger;