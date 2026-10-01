const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticateScheduleUser(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.accountType === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot access user schedules' });
    }

    const user = await User.findById(decoded.id).select('_id isAdmin name status module');
    if (!user || user.isAdmin) {
      return res.status(403).json({ error: 'User access required' });
    }

    req.user = user;
    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticateScheduleUser };
