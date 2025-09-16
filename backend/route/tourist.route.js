// 'use strict';
// const router = require('express').Router();
// const touristController = require('../controller/tourist.controller');
// const { auth } = require('../middleware/auth.middleware');

// // tourist lifecycle
// router.post('/register', auth, touristController.registerTourist);
// router.post('/location', touristController.locationUpdate);
// router.get('/verify/:touristId', auth, touristController.verifyTourist);

// module.exports = router;
'use strict';
const router = require('express').Router();
const touristController = require('../controller/trip.controller.js');
const mlController = require('../controller/ml.controller.js')

const { auth, requireRole } = require('../middleware/auth.middleware.js');

// register primary (walletId) + family digitalIds after KYC approved
router.post('/register', auth, requireRole(['tourist']), touristController.registerTourist);

// location update (existing)
router.post('/location-update',  touristController.locationUpdate);

// verify on-chain
router.get('/verify/:touristId', auth, touristController.verifyTourist);

router.post('/predict_anomaly', auth,  mlController.predictAnomaly);
router.post('/geofence', auth, mlController.geofence);


router.post('/add_geofence',auth, mlController.addGeofence)

module.exports = router;
