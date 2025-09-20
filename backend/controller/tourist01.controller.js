'use strict';

const crypto = require('crypto');
const { customAlphabet } = require('nanoid');
const { submitTransaction, evaluateTransaction } = require('../services/fabricService');
const KycRequest = require('../models/kyc.model');
const DigitalId = require('../models/digitalId.model');
const Location = require('../models/location.model');
const SosAlert = require('../models/alert.model');
const Feedback = require('../models/feedback.model');
const EFIR = require('../models/fir.model');
const mlService = require('../services/mlService.js');
const Anomaly = require('../models/anomoly.model');
const NotificationService = require('../services/notificationService');

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

function decryptObject(encryptedObj) {
    const key = getAesKeyBuffer();
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const encryptedData = Buffer.from(encryptedObj.data, 'hex');
    const tag = Buffer.from(encryptedObj.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
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

// ---------- Tourist Registration ----------
exports.registerTourist = async (req, res, next) => {
    try {
        const { org = DEFAULT_ORG, identity = DEFAULT_IDENTITY, expiryAt, itinerary = {}, emergencyContacts = [], deviceId } = req.body;
        const walletId = req.user?.walletId;

        if (!walletId || !expiryAt) {
            return res.status(400).json({ success: false, message: 'walletId and expiryAt are required' });
        }

        // Check primary KYC
        const primaryKyc = await KycRequest.findOne({
            touristId: walletId,
            status: { $in: ['approved', 'auto_approved'] }
        }).lean();

        if (!primaryKyc) {
            return res.status(403).json({ success: false, message: 'Primary KYC not approved' });
        }

        const primaryDigitalId = walletId;

        // Check if already registered in MongoDB
        const existingDigitalId = await DigitalId.findOne({ digitalId: primaryDigitalId });
        if (existingDigitalId && existingDigitalId.status !== 'expired') {
            return res.json({
                success: true,
                message: 'Tourist already registered',
                data: { digitalId: primaryDigitalId }
            });
        }

        // Encrypt sensitive data
        const itineraryEnc = encryptObject(itinerary);
        const contactsEnc = encryptObject(emergencyContacts);
        const itinerarySummary = makeItinerarySummary(itinerary);

        // Calculate initial safety score
        const securityScore = await calculateInitialSafetyScore(itinerarySummary);

        // Create digital ID document
        const digitalIdData = {
            digitalId: primaryDigitalId,
            walletId,
            kycRequestId: primaryKyc._id,
            kycHash: primaryKyc.kycHash,
            itineraryEncrypted: itineraryEnc,
            emergencyContactsEncrypted: contactsEnc,
            itinerarySummary,
            status: 'registered',
            expiryAt: new Date(expiryAt),
            securityScore,
            devices: deviceId ? [{
                deviceId,
                registeredAt: new Date(),
                lastActive: new Date()
            }] : []
        };

        // Register on blockchain
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
        digitalIdData.chainTx = parsedChain;

        // Save to MongoDB
        const digitalIdDoc = await DigitalId.create(digitalIdData);

        return res.json({
            success: true,
            message: 'Tourist registered successfully',
            data: { 
                digitalId: primaryDigitalId,
                expiryAt: digitalIdDoc.expiryAt,
                securityScore: digitalIdDoc.securityScore
            }
        });

    } catch (err) {
        console.error('registerTourist error:', err);
        return next(err);
    }
};

// ---------- Location Update ----------
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
        const locationData = new Location({
            touristId,
            deviceId,
            lat: loc.lat,
            lon: loc.lon,
            speed: loc.speed,
            ts
        });
        await locationData.save();

        // Update last known location in digital ID
        await DigitalId.updateOne(
            { digitalId: touristId },
            { 
                $set: { 
                    lastKnownLocation: {
                        lat: loc.lat,
                        lon: loc.lon,
                        timestamp: ts
                    }
                },
                $addToSet: { devices: { deviceId, lastActive: new Date() } }
            }
        );

        // Get last 21 records for anomaly detection
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

        // Check geofence
        const geofences = await mlService.checkGeofence({
            touristId, 
            lat: lastPoint.lat,
            lon: lastPoint.lon
        });

        let anomaly = null;

        // Run anomaly detection only if we have 21 or more points
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

                // Notify authorities about anomaly
                await NotificationService.notifyAuthorities({
                    touristId,
                    type: 'ANOMALY_DETECTED',
                    location: { lat: lastPoint.lat, lon: lastPoint.lon },
                    score: mlResult.score,
                    timestamp: new Date()
                });
            }
        }

        return res.json({
            success: true,
            anomaly,
            geofences
        });

    } catch (err) {
        console.error('locationUpdate error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- SOS Alert ----------
exports.sosAlert = async (req, res, next) => {
    try {
        const { touristId, deviceId, location, message } = req.body;
        
        if (!touristId) {
            return res.status(400).json({ success: false, message: 'touristId is required' });
        }

        // Get tourist details
        const tourist = await DigitalId.findOne({ digitalId: touristId });
        if (!tourist) {
            return res.status(404).json({ success: false, message: 'Tourist not found' });
        }

        // Create SOS alert
        const sosAlert = new SosAlert({
            touristId,
            deviceId,
            location: location || tourist.lastKnownLocation,
            message,
            status: 'active',
            respondedBy: null,
            responseTime: null
        });
        await sosAlert.save();

        // Notify emergency contacts
        const emergencyContacts = decryptObject(tourist.emergencyContactsEncrypted);
        for (const contact of emergencyContacts) {
            await NotificationService.notifyEmergencyContact(
                contact, 
                touristId, 
                location || tourist.lastKnownLocation,
                message
            );
        }

        // Notify authorities
        await NotificationService.notifyAuthorities({
            touristId,
            type: 'SOS_ALERT',
            location: location || tourist.lastKnownLocation,
            message,
            timestamp: new Date(),
            emergencyContacts
        });

        return res.json({
            success: true,
            message: 'SOS alert triggered successfully',
            alertId: sosAlert._id
        });

    } catch (err) {
        console.error('sosAlert error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- Submit Feedback ----------
exports.submitFeedback = async (req, res, next) => {
    try {
        const { touristId, rating, comments, category } = req.body;
        
        if (!touristId || !rating) {
            return res.status(400).json({ success: false, message: 'touristId and rating are required' });
        }

        const feedback = new Feedback({
            touristId,
            rating,
            comments,
            category,
            status: 'submitted'
        });
        await feedback.save();

        return res.json({
            success: true,
            message: 'Feedback submitted successfully',
            feedbackId: feedback._id
        });

    } catch (err) {
        console.error('submitFeedback error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- File e-FIR ----------
exports.fileEFIR = async (req, res, next) => {
    try {
        const { touristId, incidentDetails, location, dateTime, witnesses } = req.body;
        
        if (!touristId || !incidentDetails) {
            return res.status(400).json({ success: false, message: 'touristId and incidentDetails are required' });
        }

        const efir = new EFIR({
            touristId,
            incidentDetails,
            location,
            dateTime: dateTime || new Date(),
            witnesses,
            status: 'filed',
            assignedTo: null,
            resolution: null
        });
        await efir.save();

        // Notify police department
        await NotificationService.notifyPoliceDepartment({
            type: 'EFIR_FILED',
            touristId,
            incidentDetails,
            location,
            timestamp: new Date(),
            efirId: efir._id
        });

        return res.json({
            success: true,
            message: 'e-FIR filed successfully',
            efirId: efir._id
        });

    } catch (err) {
        console.error('fileEFIR error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- Verify Tourist (for authorities) ----------
exports.verifyTourist = async (req, res, next) => {
    try {
        const { touristId } = req.params;
        const { org = DEFAULT_ORG, identity = DEFAULT_IDENTITY } = req.query;

        if (!touristId) {
            return res.status(400).json({ success: false, message: 'touristId is required' });
        }

        // Check on blockchain
        const result = await evaluateTransaction(org, identity, 'VerifyTourist', touristId);
        let parsed;
        try { 
            parsed = JSON.parse(result.toString()); 
        } catch { 
            parsed = result.toString(); 
        }

        // Get additional details from MongoDB
        const touristDetails = await DigitalId.findOne({ digitalId: touristId });
        
        res.json({ 
            success: true, 
            data: {
                blockchain: parsed,
                additionalInfo: touristDetails ? {
                    securityScore: touristDetails.securityScore,
                    lastKnownLocation: touristDetails.lastKnownLocation,
                    devices: touristDetails.devices
                } : null
            }
        });
    } catch (err) {
        next(err);
    }
};

// ---------- Update Tourist Status (for authorities) ----------
exports.updateTouristStatus = async (req, res, next) => {
    try {
        const { touristId, status, reason } = req.body;
        const { org = DEFAULT_ORG, identity = DEFAULT_IDENTITY } = req.query;

        if (!touristId || !status) {
            return res.status(400).json({ success: false, message: 'touristId and status are required' });
        }

        let transactionName;
        let args = [touristId];

        switch (status) {
            case 'suspended':
                transactionName = 'SuspendTourist';
                if (reason) args.push(reason);
                break;
            case 'revoked':
                transactionName = 'RevokeTourist';
                if (reason) args.push(reason);
                break;
            case 'active':
                transactionName = 'ReinstateTourist';
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Update on blockchain
        const result = await safeSubmit(org, identity, transactionName, ...args);
        const parsed = JSON.parse(result.toString());

        // Update in MongoDB
        await DigitalId.updateOne(
            { digitalId: touristId },
            { 
                $set: { 
                    status,
                    updatedAt: new Date()
                }
            }
        );

        res.json({ 
            success: true, 
            message: `Tourist status updated to ${status}`,
            data: parsed
        });
    } catch (err) {
        next(err);
    }
};

// ---------- Respond to SOS (for authorities) ----------
exports.respondToSOS = async (req, res, next) => {
    try {
        const { alertId, response, officerId } = req.body;
        
        if (!alertId || !officerId) {
            return res.status(400).json({ success: false, message: 'alertId and officerId are required' });
        }

        const sosAlert = await SosAlert.findById(alertId);
        if (!sosAlert) {
            return res.status(404).json({ success: false, message: 'SOS alert not found' });
        }

        sosAlert.status = 'responded';
        sosAlert.respondedBy = officerId;
        sosAlert.responseTime = new Date() - sosAlert.createdAt;
        sosAlert.responseDetails = response;

        await sosAlert.save();

        // Notify tourist that help is on the way
        await NotificationService.notifyTourist({
            touristId: sosAlert.touristId,
            type: 'SOS_RESPONSE',
            message: `Help is on the way. ${response}`,
            officerId
        });

        return res.json({
            success: true,
            message: 'SOS response recorded successfully',
            responseTime: sosAlert.responseTime
        });

    } catch (err) {
        console.error('respondToSOS error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- Get Tourist Details (for authorities) ----------
exports.getTouristDetails = async (req, res, next) => {
    try {
        const { touristId } = req.params;
        
        if (!touristId) {
            return res.status(400).json({ success: false, message: 'touristId is required' });
        }

        // Get from MongoDB
        const tourist = await DigitalId.findOne({ digitalId: touristId });
        if (!tourist) {
            return res.status(404).json({ success: false, message: 'Tourist not found' });
        }

        // Get from blockchain
        let blockchainData = null;
        try {
            const result = await evaluateTransaction(DEFAULT_ORG, DEFAULT_IDENTITY, 'GetTourist', touristId);
            blockchainData = JSON.parse(result.toString());
        } catch (err) {
            console.warn('Could not fetch blockchain data:', err.message);
        }

        // Get recent locations
        const recentLocations = await Location.find({ touristId })
            .sort({ ts: -1 })
            .limit(10);

        // Get recent alerts
        const recentAlerts = await SosAlert.find({ touristId })
            .sort({ createdAt: -1 })
            .limit(5);

        return res.json({
            success: true,
            data: {
                digitalId: tourist,
                blockchain: blockchainData,
                recentLocations,
                recentAlerts
            }
        });

    } catch (err) {
        console.error('getTouristDetails error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------- Helper Functions ----------
async function calculateInitialSafetyScore(itinerary) {
    // Implement logic based on:
    // - Risk level of destinations
    // - Time of travel
    // - Duration of stay
    // - Other factors
    return 75; // Default medium score
}

module.exports = exports;