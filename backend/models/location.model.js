'use strict';
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  touristId: { type: String, index: true },
  deviceId: String,
  lat: Number,
  lon: Number,
  speed: Number,
  accuracy: Number,
  ts: { type: Date, index: true }
});

module.exports = mongoose.model('Location', locationSchema);
