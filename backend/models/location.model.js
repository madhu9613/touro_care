const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  touristId: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  ts: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Location || mongoose.model("Location", locationSchema);
