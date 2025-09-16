'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

require('dotenv').config();

const authRoutes = require('./route/auth.route.js');
const touristRoutes = require('./route/tourist.route.js');
const policeRoutes = require('./route/police.route.js');
const adminRoutes=require('./route/admin.route.js')
const kycRoutes = require('./route/kyc.route.js')
const errorHandler = require('./middleware/errorHandle.middleware.js');
const app = express();

// DB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => logger.info('MongoDB connected'))
  .catch(err => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  });

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tourist', touristRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin',adminRoutes);
// Error handler
app.use(errorHandler);

module.exports = app;
