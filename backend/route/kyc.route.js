'use strict';
const router = require('express').Router();
const kycController = require('../controller/kyc.controller.js');
const { auth, requireRole } = require('../middleware/auth.middleware');
const parser = require('../middleware/upload.middleware.js'); // multer cloudinary


// Tourist submits KYC with documents
// Use 'parser.array("documents")' to handle multiple file uploads
router.post(
  '/submit',
  auth,
  requireRole(['tourist']),
  parser.array('documents', 5), // max 5 documents
  kycController.submitKyc
);

// Verify OTP for submitted KYC
router.post('/verify-otp', auth, requireRole(['tourist']), kycController.verifyOtpKyc);

// -------------------- Admin / Tourism Dept Routes --------------------

// View pending KYC requests
router.get(
  '/pending',
  auth,
  requireRole(['tourism', 'issuer', 'admin']),
  kycController.listPending
);

// Review KYC manually (approve/reject)
router.patch(
  '/review/:requestId',
  auth,
  requireRole(['tourism', 'issuer', 'admin']),
  kycController.review
);

// View latest KYC by touristId (walletId)
router.get('/tourist/:touristId', auth, kycController.getByTourist);

module.exports = router;
