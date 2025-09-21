// models/Alert.js
'use strict';
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  touristId: { type: String, index: true },
  type: { type: String, default: 'anomaly' }, // anomaly, sos, eFIR, geofence
  message: String,
  location: { lat: Number, lng: Number },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New field
  status: { type: String, enum: ['open','acknowledged','accepted','resolved'], default: 'open' }, // Added 'accepted'
  createdAt: { type: Date, default: Date.now },
  acceptedAt: Date, // New field
  updatedAt: Date
});

module.exports = mongoose.model('Alert', alertSchema);