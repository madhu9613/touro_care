'use strict';
const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'Authorization header missing' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
