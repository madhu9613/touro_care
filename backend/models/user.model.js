'use strict';
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String }, 
  roles: { type: [String], default: ['tourist'] }, // tourist, issuer, police, admin, tourism
  walletId: { type: String },
  org: { type: String, enum: ['Org1','Org2'], default: 'Org1' }, // tie to Fabric org
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
