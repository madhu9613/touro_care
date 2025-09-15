'use strict';
const mongoose = require('mongoose');

const digitalIdSchema = new mongoose.Schema({
  digitalId: { type: String, index: true, unique: true, required: true }, // generated for family or same as walletId for primary
  walletId: { type: String, index: true, required: true }, // owner walletId (primary tourist)
  kycRequestId: { type: String, required: true }, // reference to KYC request used
  kycHash: { type: String, required: true },
  memberNameEncrypted: { type: Object }, // { iv, data, tag }
  dobEncrypted: { type: Object },
  itineraryEncrypted: { type: Object },
  emergencyContactsEncrypted: { type: Object },
  itinerarySummary: { type: Object }, // minimal public summary saved off-chain and on-chain
  status: { type: String, enum: ['suspended','registered','active','revoked','pending_review'], default: 'suspended' },
  chainTx: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  expiryAt: Date
});

module.exports = mongoose.model('DigitalId', digitalIdSchema);
