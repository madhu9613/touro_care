'use strict';
const mongoose = require('mongoose');
const EFIRSchema = new mongoose.Schema({
  firId: { type: String, unique: true },
  touristId: { type: String, required: true },
  type: { type: String, required: true }, // theft, accident, harassment...
  description: String,
  attachments: [String], // URLs to encrypted photos/docs
  status: { type: String, enum: ['submitted', 'under_review', 'resolved'], default: 'submitted' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('efirschema', EFIRSchema);