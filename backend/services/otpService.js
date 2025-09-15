'use strict';
const crypto = require('crypto');

// Temporary in-memory store for OTPs
// For production, use Redis or DB with TTL
const otpStore = new Map();

/**
 * Generate 6-digit OTP and store it for a phone number
 * @param {string} phone
 * @param {number} ttlSeconds default 300s = 5 min
 */

function generateOtp(phone, ttlSeconds = 300) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    otpStore.set(phone, { otp: hashedOtp, expiresAt });
    console.log(`[OTP SERVICE] OTP for ${phone}: ${otp}`); // For demo

    return otp; // Return plain OTP for sending via SMS service
}

/**
 * Verify OTP for a phone number
 */
function verifyOtp(phone, otpInput) {
    const record = otpStore.get(phone);
    if (!record) return false;

    const now = Date.now();
    if (now > record.expiresAt) {
        otpStore.delete(phone);
        return false;
    }

    const hashedInput = crypto.createHash('sha256').update(otpInput).digest('hex');
    if (hashedInput === record.otp) {
        otpStore.delete(phone);
        return true;
    }

    return false;
}

module.exports = { generateOtp, verifyOtp };
