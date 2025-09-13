"use strict";
const mongoose = require("mongoose");

const destSchema = new mongoose.Schema({
  location: String,
  startDate: Date,
  endDate: Date,
  accommodation: String
});

const touristSchema = new mongoose.Schema({
  touristId: { type: String, required: true, unique: true },
  name: String,
  kycHash: String,
  itinerary: {
    destinations: [destSchema],
    transportation: [String]
  },
  emergencyContacts: [
    {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  ],
  issuer: String,
  issuerId: String,
  expiryAt: Date,
  status: { type: String, enum: ["active", "revoked", "expired", "suspended"], default: "active" },
  metadata: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model("Tourist", touristSchema);
