// 'use strict';
// const mongoose = require('mongoose');

// const feedbackSchema = new mongoose.Schema({
//   touristId: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   rating: Number,
//   message: String,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Feedback', feedbackSchema);


// Enhanced digitalId.model.js - More comprehensive schema
const digitalIdSchema = new Schema({
  digitalId: { type: String, required: true, unique: true }, // Primary identifier
  walletId: { type: String, required: true }, // Linked wallet
  kycRequestId: { type: Schema.Types.ObjectId, ref: 'KycRequest' },
  kycHash: { type: String, required: true }, // Hash of KYC data stored on blockchain
  itineraryEncrypted: { // Encrypted itinerary data
    iv: String,
    data: String,
    tag: String
  },
  emergencyContactsEncrypted: { // Encrypted contacts
    iv: String,
    data: String,
    tag: String
  },
  itinerarySummary: { // Non-sensitive summary for quick access
    destinations: [{
      location: String,
      startDate: Date,
      endDate: Date
    }]
  },
  status: { 
    type: String, 
    enum: ['pending', 'registered', 'active', 'suspended', 'expired', 'revoked'],
    default: 'pending'
  },
  expiryAt: { type: Date, required: true },
  chainTx: { // Blockchain transaction details
    txId: String,
    blockNumber: Number,
    timestamp: Date
  },
  securityScore: { type: Number, min: 0, max: 100 }, // Tourist safety score
  lastKnownLocation: {
    lat: Number,
    lon: Number,
    timestamp: Date
  },
  devices: [{
    deviceId: String,
    registeredAt: Date,
    lastActive: Date
  }]
}, {
  timestamps: true
});