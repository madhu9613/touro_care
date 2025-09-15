'use strict';
const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  touristId: { type: String, index: true },
  type: String,
  score: Number,
  explanation: String,
  locations: [Object],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Anomaly', anomalySchema);
