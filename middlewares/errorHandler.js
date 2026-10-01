const multer = require('multer');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Server Error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method 
  });

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Maximum size is 8 MB.' : `Upload error: ${err.message}`;
    return res.status(400).json({ error: message });
  }

  const status = (err.status && err.status >= 400 && err.status < 500) ? err.status : 500;
  res.status(status).json({
    error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
}

module.exports = { errorHandler };
