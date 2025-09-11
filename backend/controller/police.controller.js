"use strict";

const { submitTransaction, evaluateTransaction } = require("../services/fabricService.js");
const logger = require("../utils/logger");

/**
 * Get list of tourists currently marked as active (in danger / needing monitoring).
 */
exports.getActiveTourists = async (req, res, next) => {
  try {
    const resultBuffer = await evaluateTransaction("TouristContract", "GetActiveTourists");
    const result = JSON.parse(resultBuffer.toString());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching active tourists:", error);
    next(error);
  }
};

/**
 * Get location and anomaly history of a specific tourist.
 */
exports.getTouristHistory = async (req, res, next) => {
  try {
    const { touristId } = req.params;
    if (!touristId) {
      return res.status(400).json({ success: false, message: "touristId is required" });
    }

    const resultBuffer = await evaluateTransaction(
      "TouristContract",
      "GetTouristHistory",
      touristId
    );
    const history = JSON.parse(resultBuffer.toString());

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error(`Error fetching history for tourist ${req.params.touristId}:`, error);
    next(error);
  }
};
