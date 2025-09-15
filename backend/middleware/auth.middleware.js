'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'Authorization header missing' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach payload
    req.user = payload;
    // optionally fetch fresh user
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { ...payload, _doc: user };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// requireRole middleware: pass array of allowed roles
exports.requireRole = (allowed = []) => {
  return (req, res, next) => {
    try {
      const roles = req.user.roles || [];
      const org = req.user.org || null;
      // role match or org-level (e.g., Org1 for tourism)
      const ok = roles.some(r => allowed.includes(r)) || (allowed.includes(req.user.org));
      if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient role' });
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  };
};
