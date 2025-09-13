const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  touristId: { type: String, required: true },

  deviceId: { type: String },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  accuracy: { type: Number },
  ts: { type: Date, required: true }

});



module.exports = mongoose.models.Location || mongoose.model("Location", locationSchema);
