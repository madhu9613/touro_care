'use strict';
const axios = require('axios');
const logger = require('../utils/logger');

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8080/predict/anomaly';

const TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '10000', 10);

async function analyzeSequence(touristId, seq) {
  try {
    const latitudes = seq.map(d => d.lat);
    const longitudes = seq.map(d => d.lon);
    const timestamps = seq.map(d => Math.floor(new Date(d.ts).getTime() / 1000));

    const resp = await axios.post(
      ML_URL,
      { latitudes, longitudes, timestamps },
      { timeout: TIMEOUT }
    );

    console.log("ML raw response:", JSON.stringify(resp.data, null, 2)); 

    const mlData = resp.data?.data?.ml;   // fits your JSON
    if (!mlData) {
      logger.error("Invalid ML response format:", resp.data);
      throw new Error("Invalid ML response format");
    }

    const { anomaly_score, sequence_length } = mlData;

    return {
      anomaly: anomaly_score > 0.65,
      score: anomaly_score,
      length: sequence_length,
      explanation: anomaly_score > 0.65
        ? "Detected unusual movement pattern"
        : "Normal behavior"
    };
  } catch (err) {
    logger.error(`ML service error: ${err.message}`);
    throw new Error("ML service unavailable");
  }
}

module.exports = { analyzeSequence };
