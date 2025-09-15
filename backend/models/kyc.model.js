'use strict';
const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  requestId: { type: String, index: true },
  touristId: { type: String, required: true, index: true }, // local app id (not blockchain)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payload: { type: Object }, 
  documents: [{ 
    filename: String,
    mimetype: String,
    url: String
  }],
  kycHash: String, 
  status: { type: String, enum: ['pending','auto_approved','approved','rejected'], default: 'pending' },
  autoResult: { type: Object },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  reviewComment: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('KycRequest', kycSchema);
