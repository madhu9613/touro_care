'use strict';
const axios = require('axios');
const logger = require('../utils/logger');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000/predict';
const TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '10000', 10);

async function analyzeSequence(touristId, locations) {
  try {
    const resp = await axios.post(ML_URL, { touristId, sequence: locations }, { timeout: TIMEOUT });
    // Expect object: { anomaly: bool, score: number, type: string, explanation: string }
    return resp.data;
  } catch (err) {
    logger.error(`ML service error: ${err.message}`);
    throw new Error('ML service unavailable');
  }
}

module.exports = { analyzeSequence };
