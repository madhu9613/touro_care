'use strict';
const crypto = require('crypto'); // <-- FIXED: crypto import
const KycRequest = require('../models/kyc.model');
const { generateOtp } = require('../services/otpService');
const adhaarDB = require('../config/adhar.json'); // mock Aadhaar JSON

// Mask Aadhaar: show only last 4 digits
function maskAadhaar(aadhaarNumber) {
  if (aadhaarNumber.length < 4) return 'XXXX';
  return `XXX-XXX-XXX-${aadhaarNumber.slice(-4)}`;
}

// Compute SHA256 hash for Aadhaar + name + dob
function computeKycHash(aadhaarNumber, name, dob) {
  return crypto.createHash('sha256').update(`${aadhaarNumber}|${name}|${dob}`).digest('hex');
}

// In-memory OTP store for demo
const otpStore = {};

/**
 * Submit KYC
 */

exports.submitKyc = async (req, res, next) => {
  try {
    const user = req.user; // logged-in tourist
    const { aadhaarNumber, name, dob } = req.body;

    if (!aadhaarNumber || !name || !dob) {
      return res.status(400).json({ success: false, message: 'aadhaarNumber, name, dob required' });
    }

    const kycHash = computeKycHash(aadhaarNumber, name, dob);

    // Check if this Aadhaar already approved for the same tourist
    const existingKyc = await KycRequest.findOne({
      touristId: user.walletId,
      kycHash,
      status: { $in: ['approved', 'auto_approved'] }
    });
    if (existingKyc) {
      return res.status(400).json({ success: false, message: 'This Aadhaar is already verified for you' });
    }

    // Verify Aadhaar details from mock DB
    const record = adhaarDB.find(a => a.aadhaarNumber === aadhaarNumber);

    let status = 'pending';
    let autoResult = null;
    let documents = req.files?.map(f => ({
      filename: f.originalname,
      mimetype: f.mimetype,
      url: f.path
    })) || [];

    if (!record || record.name !== name || record.dob !== dob) {
      // Aadhaar mismatch → require proof documents
      if (!documents.length) {
        return res.status(400).json({ success: false, message: 'Proof documents required for manual review' });
      }
      autoResult = { reason: 'Aadhaar details mismatch', proofProvided: true };
      console.log(`Aadhaar mismatch for ${aadhaarNumber}, sent for manual review.`);
    } else {
      // Aadhaar match → generate OTP
      const otp = generateOtp();
      otpStore[kycHash] = {
        otp,
        touristId: user.walletId,
        expires: Date.now() + 5 * 60 * 1000 // 5 min expiry
      };
      console.log(`Demo OTP for ${aadhaarNumber}: ${otp}`);
    }

    // Save KYC request
    const kycDoc = await KycRequest.create({
      requestId: `KYC-${Date.now()}`,
      touristId: user.walletId,
      userId: user._id,
      payload: {
        aadhaarNumber: maskAadhaar(aadhaarNumber),
        name,
        dob
      },
      documents,
      kycHash,
      status,
      autoResult,
      createdAt: new Date()
    });

    return res.json({
      success: true,
      message: record && record.name === name && record.dob === dob
        ? 'OTP sent to linked mobile number'
        : 'Aadhaar details mismatched; sent for manual review with proof documents',
      requestId: kycDoc.requestId
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP
 */
exports.verifyOtpKyc = async (req, res, next) => {
  try {
    const user = req.user;
    const { requestId, otp } = req.body;

    if (!requestId || !otp) {
      return res.status(400).json({ success: false, message: 'requestId and otp required' });
    }

    const kycDoc = await KycRequest.findOne({ requestId, touristId: user.walletId });
    if (!kycDoc) {
      return res.status(404).json({ success: false, message: 'KYC request not found' });
    }

    const storedOtp = otpStore[kycDoc.kycHash];
    if (!storedOtp || storedOtp.touristId !== user.walletId || Date.now() > storedOtp.expires) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // OTP verified → update status
    kycDoc.status = 'approved';
    kycDoc.updatedAt = new Date();
    await kycDoc.save();

    // Remove OTP from store
    delete otpStore[kycDoc.kycHash];

    return res.json({ success: true, message: 'KYC verified successfully', requestId });

  } catch (err) {
    next(err);
  }
};

/**
 * List pending KYC requests for tourism dept
 */
exports.listPending = async (req, res, next) => {
  try {
    const list = await KycRequest.find({ status: 'pending' });
    res.json({ success: true, pending: list });
  } catch (err) {
    next(err);
  }
};

/**
 * Review KYC manually (approve/reject)
 */
exports.review = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status,comment } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const kycDoc = await KycRequest.findOne({ requestId });
    if (!kycDoc) return res.status(404).json({ message: 'KYC request not found' });

   kycDoc.status = status;
    kycDoc.reviewComment = comment || '';
    kycDoc.reviewerId = req.user._id;
    kycDoc.updatedAt = new Date();
    await kycDoc.save();

    res.json({ success: true, kyc: kycDoc });
  } catch (err) {
    next(err);
  }
};

/**
 * Get KYC by touristId
 */
exports.getByTourist = async (req, res, next) => {
  try {
    const { touristId } = req.params;
    const kycs = await KycRequest.find({ touristId }).sort({ createdAt: -1 }); // allow multiple KYC per user
    if (!kycs.length) return res.status(404).json({ message: 'KYC not found' });

    res.json({ success: true, kycs });
  } catch (err) {
    next(err);
  }
};
