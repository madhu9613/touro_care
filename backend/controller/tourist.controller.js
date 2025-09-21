'use strict';

const { submitTransaction, evaluateTransaction } = require('../services/fabricService');
const mlService = require('../services/mlService');
const Location = require('../models/location.model.js');
const Anomaly = require('../models/anomoly.model.js');

/**
 * Register a new tourist on-chain
 * Body:
 * {
 *   org, identity, touristId, kycHash,
 *   itinerary, emergencyContacts, expiryAt, friends
 * }
 */

exports.registerTourist = async (req, res, next) => {
  try {
    const {
      org = 'Org1',
      identity = 'admin',
      touristId="t_1757964252657",
      kycHash="40e928dffa9836897433e9dbb8f6298c9ac051a5c06499d28c2b5937f777e4df",
      itinerary = {},
      emergencyContacts = [],
      expiryAt
    } = req.body;

    if (!touristId || !kycHash || !expiryAt) {
      return res.status(400).json({ success: false, message: 'touristId, kycHash, expiryAt are required' });
    }

    // Call chaincode with exactly 6 parameters after ctx
    const result = await submitTransaction(
      org,
      identity,
      'RegisterTourist',
      touristId,
      kycHash,
      JSON.stringify(itinerary),
      JSON.stringify(emergencyContacts),
      expiryAt
    );

    res.json({
      success: true,
      data: JSON.parse(result.toString())
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload a batch of location updates
 * Body:
 * {
 *   org, identity, touristId, deviceId,
 *   locations: [{ lat, lon, ts, speed, accuracy }]
 * }
 */
exports.locationUpdate = async (req, res, next) => {
  try {
    const {
      org = 'Org1',
      identity = 't1',
      touristId,
      deviceId,
      locations
    } = req.body;

    if (!touristId || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ success: false, message: 'touristId & non-empty locations array are required' });
    }

    // Persist locations off-chain
    const docs = locations.map(l => ({
      touristId,
      deviceId,
      lat: l.lat,
      lon: l.lon,
      speed: l.speed || 0,
      accuracy: l.accuracy || null,
      ts: new Date(l.ts)
    }));
    await Location.insertMany(docs);

    // Build recent sequence for ML (last 60 points max)
    const recent = await Location.find({ touristId })
      .sort({ ts: -1 })
      .limit(20)
      .lean();

    const seq = recent.reverse().map(d => ({
      lat: d.lat,
      lon: d.lon,
      speed: d.speed,
      ts: d.ts
    }));

    // Analyze with ML service
    const mlResult = await mlService.analyzeSequence(touristId, seq);

    const currentLocation = { touristId, ...seq[seq.length - 1]};
    const Geofences = await mlService.checkGeofence(currentLocation)
    console.log(Geofences)

    // If anomaly detected → store in DB and append to ledger
    if (mlResult?.anomaly && mlResult.score >= 0.65) {
      const anomalyDoc = await Anomaly.create({
        touristId,
        type: mlResult.type || 'unknown',
        score: mlResult.score,
        explanation: mlResult.explanation || '',
        locations: seq
      });

      // Summary for on-chain storage
      const anomalySummary = {
        id: anomalyDoc._id.toString(),
        type: anomalyDoc.type,
        score: anomalyDoc.score,
        summary: (anomalyDoc.explanation || '').slice(0, 200),
        offChainRef: anomalyDoc._id.toString()
      };

      await submitTransaction(org, identity, 'AppendAnomaly', touristId, JSON.stringify(anomalySummary));
    }

    res.json({
      success: true,
      data: { ml: mlResult }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify a tourist’s validity
 * Params: touristId
 * Body: { org, identity }
 */

exports.verifyTourist = async (req, res, next) => {
  try {
    const { touristId } = req.params;
    const { org = 'Org1', identity = 't1' } = req.query; // safer for GET

    if (!touristId) {
      return res.status(400).json({ success: false, message: 'touristId is required' });
    }

    const result = await evaluateTransaction(org, identity, 'VerifyTourist', touristId);

    let parsed;
    try {
      parsed = JSON.parse(result.toString());
    } catch {
      parsed = result.toString();
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
};

exports.getDigitalId = async (req, res, next) => {
  try {
    const { touristId } = req.params;

    if (!touristId) {
      return res.status(400).json({ success: false, message: 'touristId is required' });
    }

    // Fetch from MongoDB using DigitalId schema
    const digitalIdData = await DigitalId.findOne({ touristId }).lean();

    if (!digitalIdData) {
      return res.status(404).json({ success: false, message: 'Digital ID not found' });
    }

    res.json({
      success: true,
      data: digitalIdData
    });
  } catch (err) {
    next(err);
  }
};