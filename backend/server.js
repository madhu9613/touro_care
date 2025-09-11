'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Backend service listening on port ${PORT}`);
  console.log(`Backend service listening on port ${PORT}`);
});
