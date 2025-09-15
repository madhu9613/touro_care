'use strict';
const router = require('express').Router();
const authController = require('../controller/auth.controller.js');
const { auth } = require('../middleware/auth.middleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);

module.exports = router;
