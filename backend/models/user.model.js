'use strict';
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String }, // optional if using OAuth
  roles: { type: [String], default: ['tourist'] }, // e.g., 'tourist', 'issuer', 'police', 'admin'
  walletId: { type: String }, // identity name in Fabric wallet
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
