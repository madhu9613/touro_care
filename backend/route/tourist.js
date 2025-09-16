'use strict';
const router = require('express').Router();
const touristController = require('../controller/tourist.controller');
const mlController = require('../controller/ml.controller.js')
const { auth } = require('../middleware/auth.middleware');

// tourist lifecycle
router.post('/register', auth, touristController.registerTourist);
router.post('/location', touristController.locationUpdate);
router.get('/verify/:touristId', auth, touristController.verifyTourist);
router.post('/predict_anomaly', mlController.predictAnomaly);
router.post('/geofence', mlController.geofence);
router.post('/add_geofence', mlController.addGeofence)


module.exports = router;
