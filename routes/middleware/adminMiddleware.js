const User = require('../../models/User');

exports.adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isAdmin) return res.status(403).json({ error: 'Admins only' });
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
