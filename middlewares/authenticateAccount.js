const jwt = require('jsonwebtoken');

function authenticateAccount(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.auth = { ...(req.auth || {}), decoded };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticateAccount };
