'use strict';
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  touristId: { type: String, index: true },
  type: { type: String, default: 'anomaly' }, // anomaly, sos, eFIR, geofence
  message: String,
  location: { lat: Number, lng: Number },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open','acknowledged','resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Alert', alertSchema);
