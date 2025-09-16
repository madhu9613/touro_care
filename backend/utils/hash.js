const crypto = require('crypto');
exports.sha256 = (input) => {
  return crypto.createHash('sha256').update(typeof input === 'string' ? input : JSON.stringify(input)).digest('hex');
};
