'use strict';
const express = require('express');
const router = express.Router();
const alertController = require('../controller/alert.controller'); // notice "controllers" folder
const { auth } = require('../middleware/auth.middleware'); // your auth middleware

// Get all alerts
router.get('/', auth, alertController.getAlerts);

// Accept an alert
router.patch('/:alertId/accept', auth, alertController.acceptAlert);

module.exports = router;
