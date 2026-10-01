console.log('✅ admin routes loaded');

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Registration = require('../models/Registration');

const { authMiddleware } = require('./middleware/auth');
const { adminMiddleware } = require('./middleware/adminMiddleware');

// quick test
router.get('/ping', (req, res) => res.json({ ok: true }));

// USERS LIST
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// REGISTRATIONS LIST
router.get('/registrations', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const regs = await Registration.find()
      .populate('userId', 'name email status isAdmin')
      .sort({ createdAt: -1 });

    res.json(regs);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DETAILS (USER + REGISTRATION)
router.get('/users/:id/details', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const registration = await Registration.findOne({ userId: user._id });
    res.json({ user, registration });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE USER (also delete registration)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.isAdmin) return res.status(403).json({ error: 'Cannot delete admin' });

    await Registration.deleteOne({ userId: target._id });
    await User.findByIdAndDelete(target._id);

    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
