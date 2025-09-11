'use strict';
const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  touristId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  score: { type: Number, required: true },
  explanation: { type: String },
  locations: [{ lat: Number, lon: Number, ts: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Anomaly', anomalySchema);
