'use strict';
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  touristId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);


