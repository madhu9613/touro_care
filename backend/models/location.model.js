const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  touristId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Location || mongoose.model("Location", locationSchema);
