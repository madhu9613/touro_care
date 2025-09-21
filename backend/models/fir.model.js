'use strict';
const mongoose = require('mongoose');

const EFIRSchema = new mongoose.Schema({
  efirId: { type: String, unique: true },
  touristId: { type: String, required: true },
  incidentDetails: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  dateTime: { type: Date, default: Date.now },
  attachments: [String],
  status: { type: String, enum: ['submitted', 'under_review', 'resolved'], default: 'submitted' },
  assignedTo: { type: String, default: null },
  resolution: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


// Update `updatedAt` on every save
EFIRSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EFIR', EFIRSchema);

