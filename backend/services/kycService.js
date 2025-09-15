'use strict';

// This is a simple stub. Replace with real providers (OCR, 3rd-party KYC)
const { sha256 } = require('../utils/hash');

/**
 * autoVerify:
 * - accepts payload and documents (array of {filename, url, mimetype})
 * - returns { success: boolean, score: 0..1, reason }
 */
exports.autoVerify = async (payload, documents) => {
  // perform basic checks:
  // - name present, doc count >= 1, id number like passport / adh similar length
  let score = 0;
  if (payload && payload.name && payload.idNumber) score += 0.4;
  if (documents && documents.length >= 1) score += 0.4;
  if (payload && payload.phone) score += 0.1;
  if (payload && payload.email) score += 0.1;

  const success = score >= 0.8; // tune threshold
  return {
    success,
    score,
    reason: success ? 'auto-verified' : 'low-confidence',
    audit: {
      checks: {
        hasName: !!payload.name,
        hasIdNumber: !!payload.idNumber,
        hasDoc: documents && documents.length >= 1
      }
    }
  };
};

exports.computeKycHash = (payload, documents) => {
  // combine payload + doc urls into canonical string and SHA256
  const docs = (documents || []).map(d => d.url || d.filename || '').sort();
  return sha256({ payload, docs });
};
