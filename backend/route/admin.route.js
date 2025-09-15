'use strict';
const router = require('express').Router();
const adminController = require('../controller/admin.controller.js');
const { auth, requireRole } = require('../middleware/auth.middleware');

router.get('/users', auth, requireRole(['admin']), adminController.listUsers);
router.delete('/user/:id', auth, requireRole(['admin']), adminController.deleteUser);
router.patch('/user/:id/roles', auth, requireRole(['admin']), adminController.assignRole);

//for debuging purpose;

router.delete('/users/clean', auth, requireRole(['admin']), adminController.cleanUsers);

module.exports = router;
