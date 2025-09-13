'use strict';
const router = require('express').Router();
const touristController = require('../controller/tourist.controller');
const { auth } = require('../middleware/auth.middleware');

// tourist lifecycle
router.post('/register', auth, touristController.registerTourist);
router.post('/location', touristController.locationUpdate);
router.get('/verify/:touristId', auth, touristController.verifyTourist);

module.exports = router;
