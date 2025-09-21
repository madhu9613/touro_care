'use strict';
const router = require('express').Router();
const adminController = require('../controller/admin.controller.js');
const { auth, requireRole } = require('../middleware/auth.middleware');
const alertModel = require('../models/alert.model.js');


router.get('/users', auth, requireRole(['admin']), adminController.listUsers);
router.delete('/user/:id', auth, requireRole(['admin']), adminController.deleteUser);
router.patch('/user/:id/roles', auth, requireRole(['admin']), adminController.assignRole);

//for debuging purpose;

router.delete('/users/clean', auth, requireRole(['admin']), adminController.cleanUsers);



router.get('/alerts', auth, requireRole(['tourist', 'authority']), async (req, res) => {
  try {
    const alerts = await alertModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;
