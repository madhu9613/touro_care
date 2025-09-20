'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Auth middleware: verifies JWT and attaches user document to req.user
 */
exports.auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = header.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user document from DB (exclude password hash)
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach the full user document to req.user
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowed - array of allowed roles
 */
exports.requireRole = (allowed = []) => {
  return (req, res, next) => {
    try {
      const roles = req.user.roles || [];
      const org = req.user.org || null;

      // Check if any role matches OR org-level permission
      const ok = roles.some(r => allowed.includes(r)) || (allowed.includes(org));

      if (!ok) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }

      next();
    } catch (err) {
      console.error('Role check error:', err.message);
      return res.status(403).json({ message: 'Forbidden' });
    }
  };
};
