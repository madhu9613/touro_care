'use strict';
const axios = require('axios');

const mlService = require('../services/mlService');
const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8080';

exports.predictAnomaly = async (req, res, next) => {
  try {
    const {
      org = 'Org1',
      identity = 'appUser',
      touristId,
      deviceId,
      locations
    } = req.body;

    if (!touristId || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'touristId & non-empty locations array are required'
      });
    }

    // Build sequence for ML (take last 20 points max)
    const recent = locations.slice(-21);
    const seq = recent.map(d => ({
      lat: d.lat,
      lon: d.lon,
      speed: d.speed || 0,
      ts: new Date(d.ts)
    }));

    // Send to ML service
    const mlResult = await mlService.analyzeSequence(touristId, seq);

    // Return ML result directly
    res.json({
      success: true,
      data: { ml: mlResult }
    });
  } catch (err) {
    next(err);
  }
};



exports.geofence = async (req, res, next) => {
    try {
        const data = req.body
        const flagged = await mlService.checkGeofence(data)
        res.status(200).json({ actions: flagged })

    } catch (error) {
        throw new error("error")
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

exports.addGeofence = async(req, res, next) => {
    try {
        const data = req.body
        const added = await axios.post(`${ML_URL}/add_geofence`, data)
        res.status(200).json(added.data)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}


