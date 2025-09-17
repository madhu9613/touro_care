'use strict';
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8080';
const TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '10000', 10);

async function analyzeSequence(touristId, seq) {
  try {
    const latitudes = seq.map(d => d.lat);
    const longitudes = seq.map(d => d.lon);
    const timestamps = seq.map(d => d.ts);

    const resp = await axios.post(
      `${ML_URL}/predict/anomaly`,
      { latitudes, longitudes, timestamps },
      { timeout: TIMEOUT }
    );

    const response = resp.data;
    console.log("ML raw response:", JSON.stringify(response, null, 2));

    if (response.success && response.anomaly_score !== undefined) {
      return {
        success: true,
        anomaly_score: response.anomaly_score,
        isAnomaly: response.isAnomaly,
        score: response.anomaly_score,
        sequence_length: response.sequence_length
      };
    } 
  } catch (err) {
    // logger.error("ML service error:", err.message);
    // res.status(500)
    // console.log(err)
  }
}


async function checkGeofence(data) {
    const resp = await axios.post(`${ML_URL}/ingest/ping`, data)
    return resp.data.actions;
}


module.exports = { analyzeSequence, checkGeofence };
