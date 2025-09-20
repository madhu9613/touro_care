// 'use strict';
// const router = require('express').Router();
// const touristController = require('../controller/tourist.controller');
// const { auth } = require('../middleware/auth.middleware');

// router.post('/register', auth, touristController.registerTourist);
// router.post('/location', touristController.locationUpdate);
// router.get('/verify/:touristId', auth, touristController.verifyTourist);

// module.exports = router;

// --->
// 'use strict';
// const router = require('express').Router();
// const touristController = require('../controller/trip.controller.js');
// const mlController = require('../controller/ml.controller.js')

// const { auth, requireRole } = require('../middleware/auth.middleware.js');

// // register primary (walletId) + family digitalIds after KYC approved
// router.post('/register', auth, requireRole(['tourist']), touristController.registerTourist);

// // location update (existing)
// router.post('/location-update',  touristController.locationUpdate);

// // verify on-chain
// router.get('/verify/:touristId', auth, touristController.verifyTourist);

// router.post('/predict_anomaly', auth,  mlController.predictAnomaly);
// router.post('/geofence', auth, mlController.geofence);


// router.post('/add_geofence',auth, mlController.addGeofence)

// module.exports = router;

'use strict';
const router = require('express').Router();
const touristController = require('../controller/tourist01.controller.js');
const { auth, requireRole } = require('../middleware/auth.middleware');

// ================= TOURIST ROUTES =================

// Register tourist after KYC approval
router.post('/register', auth, requireRole(['tourist']), touristController.registerTourist);

// Location tracking and updates
router.post('/location', auth, requireRole(['tourist']), touristController.locationUpdate);

// SOS emergency alert
router.post('/sos', auth, requireRole(['tourist']), touristController.sosAlert);

// Submit feedback
router.post('/feedback', auth, requireRole(['tourist']), touristController.submitFeedback);

// File e-FIR (electronic First Information Report)
router.post('/efir', auth, requireRole(['tourist']), touristController.fileEFIR);

// Verify tourist status (for authorities and self)
router.get('/verify/:touristId', auth, touristController.verifyTourist);

// ================= AUTHORITY ROUTES =================

// Update tourist status (activate/deactivate/suspend/revoke)
router.patch('/status', auth, requireRole(['police', 'admin']), touristController.updateTouristStatus);

// Respond to SOS alerts
router.post('/sos/respond', auth, requireRole(['police', 'admin']), touristController.respondToSOS);

// Get comprehensive tourist details
router.get('/details/:touristId', auth, requireRole(['police', 'admin']), touristController.getTouristDetails);


// // ================= ML/ANALYTICS ROUTES =================

// // Anomaly prediction
// router.post('/predict_anomaly', auth, touristController.predictAnomaly);

// // Geofence operations
// router.post('/geofence', auth, touristController.geofence);
// router.post('/add_geofence', auth, requireRole(['admin']), touristController.addGeofence);

module.exports = router;
