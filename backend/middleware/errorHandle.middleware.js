'use strict';
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
};
