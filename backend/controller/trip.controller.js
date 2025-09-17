'use strict';

const crypto = require('crypto');
const { customAlphabet } = require('nanoid');
const { submitTransaction, evaluateTransaction } = require('../services/fabricService');
const KycRequest = require('../models/kyc.model');
const DigitalId = require('../models/digitalId.model');
const Location = require('../models/location.model')
const mlService = require('../services/mlService.js')
const Anomaly = require('../models/anomoly.model')

const nano = customAlphabet('0123456789ABCDEF', 8); // 8-char suffix
const AES_KEY = process.env.AES_256_KEY;
const DEFAULT_ORG = 'Org1';
const DEFAULT_IDENTITY = process.env.ORG_ISSUER_ID || 'admin';

// ---------- AES Helpers ----------
function getAesKeyBuffer() {
    if (!AES_KEY) throw new Error('AES_256_KEY env var not set');
    if (/^[0-9a-fA-F]{64}$/.test(AES_KEY)) return Buffer.from(AES_KEY, 'hex');
    return Buffer.from(AES_KEY, 'base64');
}

function encryptObject(obj) {
    const key = getAesKeyBuffer();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv: iv.toString('hex'), data: encrypted.toString('hex'), tag: tag.toString('hex') };
}

function makeItinerarySummary(itinerary = {}) {
    const destinations = Array.isArray(itinerary.destinations)
        ? itinerary.destinations.map(d => ({ location: d.location, startDate: d.startDate, endDate: d.endDate }))
        : [];
    return { destinations };
}

// Retry helper for MVCC conflicts
async function safeSubmit(org, identity, fn, ...args) {
    let attempt = 0;
    while (attempt < 3) {
        try {
            return await submitTransaction(org, identity, fn, ...args);
        } catch (err) {
            if (err.transactionCode === 'MVCC_READ_CONFLICT' || (err.message && err.message.includes('MVCC_READ_CONFLICT'))) {
                attempt++;
                console.warn(`Retrying ${fn} due to MVCC conflict (attempt ${attempt})`);
                await new Promise(r => setTimeout(r, 500 * attempt));
            } else throw err;
        }
    }
    throw new Error(`MVCC conflict after ${attempt} retries`);
}

// ---------- registerTourist ----------
exports.registerTourist = async (req, res, next) => {
    try {
        const { org = DEFAULT_ORG, identity = DEFAULT_IDENTITY, expiryAt, itinerary = {}, emergencyContacts = [] } = req.body;
        const walletId = req.user?.walletId;

        if (!walletId || !expiryAt) {
            return res.status(400).json({ success: false, message: 'walletId and expiryAt are required' });
        }

        // --- Step 1: Check primary KYC ---
        const primaryKyc = await KycRequest.findOne({
            touristId: walletId,
            status: { $in: ['approved', 'auto_approved'] }
        }).lean();

        if (!primaryKyc) {
            return res.status(403).json({ success: false, message: 'Primary KYC not approved' });
        }

        const primaryDigitalId = walletId;

        // --- Step 2: Verify on-chain if already registered ---
        let alreadyRegistered = false;
        // try {
        //     const verifyRes = await evaluateTransaction(org, identity, 'VerifyTourist', primaryDigitalId);
        //     const parsed = JSON.parse(verifyRes.toString());
        //     alreadyRegistered = parsed.exists || false;
        // } catch (err) {
        //     // If evaluation fails due to 'not found', we continue to registration
        //     if (!err.message.includes('does not exist') && !err.message.includes('Not Found')) {
        //         console.error('Error verifying tourist:', err.message);
        //         return res.status(500).json({ success: false, message: 'Failed to verify tourist on-chain' });
        //     }
        // }

        if (alreadyRegistered) {
            return res.json({
                success: true,
                message: 'Tourist already enrolled on-chain',
                data: { digitalId: primaryDigitalId }
            });
        }

        // --- Step 3: Encrypt itinerary & contacts ---
        const itineraryEnc = encryptObject(itinerary);
        const contactsEnc = encryptObject(emergencyContacts);
        const itinerarySummary = makeItinerarySummary(itinerary);

        // --- Step 4: Upsert MongoDB DigitalId ---
        await DigitalId.updateOne(
            { digitalId: primaryDigitalId },
            {
                $set: {
                    walletId,
                    kycRequestId: primaryKyc.requestId,
                    kycHash: primaryKyc.kycHash,
                    itineraryEncrypted: itineraryEnc,
                    emergencyContactsEncrypted: contactsEnc,
                    itinerarySummary,
                    status: 'suspended',
                    expiryAt: new Date(expiryAt),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        // --- Step 5: Register on-chain ---
        const chainRes = await safeSubmit(
            org,
            identity,
            'RegisterTourist',
            primaryDigitalId,
            primaryKyc.kycHash,
            JSON.stringify(itinerarySummary),
            JSON.stringify([]),
            new Date(expiryAt).toISOString()
        );
        const parsedChain = JSON.parse(chainRes.toString());

        // --- Step 6: Update Mongo with chainTx & status ---
        await DigitalId.updateOne(
            { digitalId: primaryDigitalId },
            { $set: { chainTx: parsedChain, status: 'registered', updatedAt: new Date() } }
        );

        // --- Step 7: Return result ---
        const primaryLocal = await DigitalId.findOne({ digitalId: primaryDigitalId }).lean();
        return res.json({
            success: true,
            message: 'Tourist registered successfully',
            data: { primary: { local: primaryLocal, chain: parsedChain } }
        });

    } catch (err) {
        console.error('registerTourist error:', err);
        return next(err);
    }
};


// ---------- locationUpdate & verifyTourist left unchanged ----------

/**
 * Location update (kept the same as your existing implementation)
 */
exports.locationUpdate = async (req, res, next) => {
  try {
    const {
      org = DEFAULT_ORG,
      identity = DEFAULT_IDENTITY,
      touristId,
      deviceId,
      locations
    } = req.body;

    if (!touristId || !Array.isArray(locations) || locations.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'touristId & exactly 1 location object are required'
      });
    }

    const loc = locations[0];
    const ts = loc.ts ? new Date(loc.ts) : new Date();

    // Save current location
    const data = new Location({
      touristId,
      deviceId,
      lat: loc.lat,
      lon: loc.lon,
      speed: loc.speed,
      ts
    });
    await data.save();

    // Get last 21 records (we need 21+ for anomaly detection)
    const recent = await Location.find({ touristId })
      .sort({ ts: -1 })
      .limit(21);

    const seq = recent
      .reverse()
      .map(d => ({
        lat: d.lat,
        lon: d.lon,
        speed: d.speed,
        ts: d.ts
      }));

    const lastPoint = seq.at(-1);
    console.log(lastPoint)

    // ✅ Always check geofence
    const Geofences = await mlService.checkGeofence({
       touristId, 
      lat: lastPoint.lat,
      lon: lastPoint.lon
    });

    let anomaly = null;

    console.log(seq.length)
    // ✅ Run anomaly detection only if we have 21 or more
    if (seq.length >= 21) {
      const mlResult = await mlService.analyzeSequence(touristId, seq);
      if (mlResult?.isAnomaly) {
        anomaly = {
          type: 'ANOMALY',
          score: mlResult.score,
          ts: new Date()
        };
        await Anomaly.create({
          touristId,
          details: anomaly,
          seq
        });
      }
    }

    return res.json({
      success: true,
      anomaly,
      Geofences
    });

  } catch (err) {
    console.error('locationUpdate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * Verify a tourist’s validity
 */
exports.verifyTourist = async (req, res, next) => {
    try {
        const { touristId } = req.params;
        const { org = DEFAULT_ORG, identity = DEFAULT_IDENTITY } = req.query;

        if (!touristId) return res.status(400).json({ success: false, message: 'touristId is required' });

        const result = await evaluateTransaction(org, identity, 'VerifyTourist', touristId);
        let parsed;
        try { parsed = JSON.parse(result.toString()); } catch { parsed = result.toString(); }

        res.json({ success: true, data: parsed });
    } catch (err) {
        next(err);
    }
};
