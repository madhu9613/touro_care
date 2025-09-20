'use strict';
const mongoose = require('mongoose');

const digitalIdSchema = new mongoose.Schema({
  digitalId: { type: String, required: true, unique: true },
  walletId: { type: String, required: true },
  kycRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'KycRequest' },
  kycHash: { type: String, required: true },
  itineraryEncrypted: { iv: String, data: String, tag: String },
  emergencyContactsEncrypted: { iv: String, data: String, tag: String },
  itinerarySummary: {
    destinations: [{ location: String, startDate: Date, endDate: Date }]
  },
  status: {
    type: String,
    enum: ['pending', 'registered', 'active', 'suspended', 'expired', 'revoked'],
    default: 'pending'
  },
  statusHistory: [{
    status: { type: String, enum: ['pending', 'registered', 'active', 'suspended', 'expired', 'revoked'] },
    reason: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String
  }],
  expiryAt: { type: Date, required: true },
  chainTx: { txId: String, blockNumber: Number, timestamp: Date },
  securityScore: { type: Number, min: 0, max: 100 },
  lastKnownLocation: { lat: Number, lon: Number, timestamp: Date },
  devices: [{ deviceId: String, registeredAt: Date, lastActive: Date }]
}, { timestamps: true });


module.exports = mongoose.model('DigitalId', digitalIdSchema);
